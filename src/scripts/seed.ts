import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from "mongoose";
import { connectDB } from "../app/lib/db";
import { Doctor } from "../app/module/doctor/doctor.model";
import { Patient } from "../app/module/patient/patient.model";

const DOCTOR_COUNT = 12;
const PATIENT_COUNT = 120;
const DAYS_BACK = 180;

const doctorData = [
  { name: "Dr. Rahim Uddin", specialization: "Cardiology", hospital: "Dhaka Medical College Hospital" },
  { name: "Dr. Nusrat Jahan", specialization: "Neurology", hospital: "Square Hospital" },
  { name: "Dr. Tanvir Ahmed", specialization: "Orthopedics", hospital: "United Hospital" },
  { name: "Dr. Farhana Akter", specialization: "Pediatrics", hospital: "Evercare Hospital" },
  { name: "Dr. Mahmudul Hasan", specialization: "Dermatology", hospital: "Labaid Hospital" },
  { name: "Dr. Sabrina Islam", specialization: "Gynecology", hospital: "Square Hospital" },
  { name: "Dr. Imran Khan", specialization: "Cardiology", hospital: "United Hospital" },
  { name: "Dr. Shirin Sultana", specialization: "Endocrinology", hospital: "Dhaka Medical College Hospital" },
  { name: "Dr. Kamal Hossain", specialization: "Gastroenterology", hospital: "Evercare Hospital" },
  { name: "Dr. Rafiq Chowdhury", specialization: "Pulmonology", hospital: "Labaid Hospital" },
  { name: "Dr. Tasnim Rahman", specialization: "Psychiatry", hospital: "Popular Medical Centre" },
  { name: "Dr. Arif Mahmud", specialization: "Urology", hospital: "Popular Medical Centre" },
];

const firstNames = {
  male: ["Karim", "Rahim", "Jamal", "Hasan", "Sohel", "Mizanur", "Faisal", "Nayeem", "Rony", "Shakil", "Habib", "Arman"],
  female: ["Ayesha", "Fatema", "Nasrin", "Sumaiya", "Rokeya", "Mim", "Tania", "Lamia", "Rima", "Sadia", "Jannat", "Mou"],
  other: ["Alex", "Sam", "Rafi"],
};
const lastNames = ["Hossain", "Ahmed", "Islam", "Rahman", "Khan", "Akter", "Begum", "Uddin", "Chowdhury", "Sarker", "Mia", "Das"];

const conditions = [
  "Hypertension",
  "Diabetes",
  "Asthma",
  "Migraine",
  "Arthritis",
  "Anemia",
  "Fever",
  "Back Pain",
  "Allergy",
  "Thyroid Disorder",
];

const genders = ["male", "female", "other"] as const;

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

// Weighted gender: mostly male and female
const pickGender = () => {
  const r = Math.random();
  if (r < 0.48) return "male";
  if (r < 0.96) return "female";
  return "other";
};

// Random date in the last N days, slightly more recent than old
const randomDate = (daysBack: number) => {
  const ratio = Math.pow(Math.random(), 1.4);
  const daysAgo = Math.floor(ratio * daysBack);
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(Math.floor(Math.random() * 10) + 8, Math.floor(Math.random() * 60), 0, 0);
  return d;
};

const phone = () => `01${pick(["7", "8", "9", "5", "6"])}${Math.floor(10000000 + Math.random() * 89999999)}`;

const seed = async () => {
  await connectDB();

  console.log("Clearing doctors and patients...");
  await Promise.all([Doctor.deleteMany({}), Patient.deleteMany({})]);

  console.log("Creating doctors...");
  const doctorDocs = doctorData.slice(0, DOCTOR_COUNT).map((d, i) => ({
    ...d,
    phone: phone(),
    email: `${d.name.toLowerCase().replace(/[^a-z]+/g, ".").replace(/^\.|\.$/g, "")}@doctortracker.test`,
    createdAt: randomDate(DAYS_BACK),
    updatedAt: new Date(),
  }));

  // timestamps: false lets us keep the custom createdAt dates
  const doctors = (await Doctor.create(doctorDocs, {
  timestamps: false,
} as any)) as unknown as any[];

  console.log("Creating patients...");
  // Some doctors are busier than others, so the bar chart is interesting
  const weights = doctors.map((_, i) => Math.max(1, doctors.length - i));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const pickDoctor = () => {
    let r = Math.random() * totalWeight;
    for (let i = 0; i < doctors.length; i++) {
      r -= weights[i];
      if (r <= 0) return doctors[i];
    }
    return doctors[0];
  };

  const patientDocs = Array.from({ length: PATIENT_COUNT }, () => {
    const gender = pickGender();
    const doctor = pickDoctor();
    const doctorCreated = new Date((doctor as any).createdAt);
    let created = randomDate(DAYS_BACK);
    // A patient cannot be added before the doctor exists
    if (created < doctorCreated) created = new Date(doctorCreated.getTime() + 60 * 60 * 1000);
    if (created > new Date()) created = new Date();

    return {
      name: `${pick(firstNames[gender])} ${pick(lastNames)}`,
      age: Math.floor(Math.random() * 75) + 3,
      gender,
      phone: phone(),
      condition: pick(conditions),
      doctor: doctor._id,
      createdAt: created,
      updatedAt: created,
    };
  });

  await Patient.insertMany(patientDocs, { timestamps: false } as any);

  console.log(`Seeded ${doctors.length} doctors and ${patientDocs.length} patients.`);
  await mongoose.disconnect();
};

seed().catch(async (error) => {
  console.error("Seeding failed", error);
  await mongoose.disconnect();
  process.exit(1);
});