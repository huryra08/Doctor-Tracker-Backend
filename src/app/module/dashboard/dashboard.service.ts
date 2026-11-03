import { PipelineStage } from "mongoose";
import { Doctor } from "../doctor/doctor.model";
import { Patient } from "../patient/patient.model";

// Start of today minus N-1 days, so "last 7 days" includes today
const startOfDaysAgo = (days: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (days - 1));
  return d;
};

const startOfMonthsAgo = (months: number) => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() - (months - 1));
  return d;
};

// Cards at the top of the dashboard
const getSummary = async () => {
  const todayStart = startOfDaysAgo(1);
  const weekStart = startOfDaysAgo(7);
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [
    totalDoctors,
    totalPatients,
    patientsToday,
    patientsThisWeek,
    patientsThisMonth,
    doctorsThisMonth,
  ] = await Promise.all([
    Doctor.estimatedDocumentCount(),
    Patient.estimatedDocumentCount(),
    Patient.countDocuments({ createdAt: { $gte: todayStart } }),
    Patient.countDocuments({ createdAt: { $gte: weekStart } }),
    Patient.countDocuments({ createdAt: { $gte: monthStart } }),
    Doctor.countDocuments({ createdAt: { $gte: monthStart } }),
  ]);

  return {
    totalDoctors,
    totalPatients,
    patientsToday,
    patientsThisWeek,
    patientsThisMonth,
    doctorsThisMonth,
    averagePatientsPerDoctor: totalDoctors
      ? Number((totalPatients / totalDoctors).toFixed(1))
      : 0,
  };
};

// Bar chart: patients per doctor (top N, plus doctors with zero patients are not shown)
const getPatientsPerDoctor = async (limit = 10) => {
  const pipeline: PipelineStage[] = [
    { $group: { _id: "$doctor", patients: { $sum: 1 } } },
    { $sort: { patients: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "doctors",
        localField: "_id",
        foreignField: "_id",
        as: "doctor",
        pipeline: [{ $project: { name: 1, specialization: 1, hospital: 1 } }],
      },
    },
    { $unwind: "$doctor" },
    {
      $project: {
        _id: 0,
        doctorId: "$_id",
        name: "$doctor.name",
        specialization: "$doctor.specialization",
        hospital: "$doctor.hospital",
        patients: 1,
      },
    },
  ];

  return Patient.aggregate(pipeline);
};

// Pie or donut chart: patients by condition (top 8, the rest grouped as Other)
const getPatientsByCondition = async () => {
  const rows = await Patient.aggregate([
    { $group: { _id: "$condition", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, condition: "$_id", count: 1 } },
  ]);

  const TOP = 8;
  if (rows.length <= TOP) return rows;

  const top = rows.slice(0, TOP);
  const otherCount = rows
    .slice(TOP)
    .reduce((sum: number, r: { count: number }) => sum + r.count, 0);
  return [...top, { condition: "Other", count: otherCount }];
};

// Donut chart: gender split
const getPatientsByGender = async () => {
  return Patient.aggregate([
    { $group: { _id: "$gender", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, gender: "$_id", count: 1 } },
  ]);
};

// Bar chart: doctors by specialization
const getDoctorsBySpecialization = async () => {
  return Doctor.aggregate([
    { $group: { _id: "$specialization", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, specialization: "$_id", count: 1 } },
  ]);
};

// Line or area chart: patients added per day for the last N days, gaps filled with 0
const getPatientsDaily = async (days = 30) => {
  const start = startOfDaysAgo(days);

  const rows = await Patient.aggregate([
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
  ]);

  const map = new Map<string, number>(
    rows.map((r: { _id: string; count: number }) => [r._id, r.count])
  );

  const result: { date: string; count: number }[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    result.push({ date: key, count: map.get(key) || 0 });
  }
  return result;
};

// Line or bar chart: patients and doctors added per month for the last N months
const getMonthlyGrowth = async (months = 6) => {
  const start = startOfMonthsAgo(months);

  const groupByMonth = [
    { $match: { createdAt: { $gte: start } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
  ];

  const [patientRows, doctorRows] = await Promise.all([
    Patient.aggregate(groupByMonth),
    Doctor.aggregate(groupByMonth),
  ]);

  const patientMap = new Map<string, number>(
    patientRows.map((r: { _id: string; count: number }) => [r._id, r.count])
  );
  const doctorMap = new Map<string, number>(
    doctorRows.map((r: { _id: string; count: number }) => [r._id, r.count])
  );

  const result: { month: string; patients: number; doctors: number }[] = [];
  for (let i = 0; i < months; i++) {
    const d = new Date(start);
    d.setMonth(start.getMonth() + i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    result.push({
      month: key,
      patients: patientMap.get(key) || 0,
      doctors: doctorMap.get(key) || 0,
    });
  }
  return result;
};

// Table: most recently added patients
const getRecentPatients = async (limit = 5) => {
  return Patient.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("doctor", "name specialization")
    .select("name age gender condition doctor createdAt")
    .lean();
};

export const DashboardServices = {
  getSummary,
  getPatientsPerDoctor,
  getPatientsByCondition,
  getPatientsByGender,
  getDoctorsBySpecialization,
  getPatientsDaily,
  getMonthlyGrowth,
  getRecentPatients,
};