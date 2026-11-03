import { z } from "zod";

const phoneRegex = /^[+]?[0-9\s-]{7,15}$/;
const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const patientBody = z.object({
  name: z.string().min(2, "Name is required"),
  age: z.coerce.number().int().min(0).max(150),
  gender: z.enum(["male", "female", "other"]),
  phone: z.string().regex(phoneRegex, "Valid phone number is required"),
  condition: z.string().min(2, "Condition is required"),
});

// POST /patients (doctor id is in the body)
const createPatientValidationSchema = z.object({
  body: patientBody.extend({ doctor: objectId }),
});

// POST /doctors/:id/patients (doctor id comes from the URL)
const createPatientForDoctorValidationSchema = z.object({
  body: patientBody,
});

// PATCH /patients/:id
const updatePatientValidationSchema = z.object({
  body: patientBody.extend({ doctor: objectId }).partial(),
});

export const PatientValidation = {
  createPatientValidationSchema,
  createPatientForDoctorValidationSchema,
  updatePatientValidationSchema,
};