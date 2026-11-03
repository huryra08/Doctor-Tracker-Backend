import { z } from "zod";

const phoneRegex = /^[+]?[0-9\s-]{7,15}$/;

const createDoctorValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name is required"),
    specialization: z.string().min(2, "Specialization is required"),
    hospital: z.string().min(2, "Hospital is required"),
    phone: z.string().regex(phoneRegex, "Valid phone number is required"),
    email: z.string().email("Valid email is required"),
  }),
});

const updateDoctorValidationSchema = z.object({
  body: z
    .object({
      name: z.string().min(2),
      specialization: z.string().min(2),
      hospital: z.string().min(2),
      phone: z.string().regex(phoneRegex),
      email: z.string().email(),
    })
    .partial(),
});

export const DoctorValidation = {
  createDoctorValidationSchema,
  updateDoctorValidationSchema,
};