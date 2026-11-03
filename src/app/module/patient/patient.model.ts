import { Schema, model } from "mongoose";
import { IPatient } from "./patient.interface";

const patientSchema = new Schema<IPatient>(
  {
    name: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0, max: 150 },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    phone: { type: String, required: true, trim: true },
    condition: { type: String, required: true, trim: true },
    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
  },
  { timestamps: true }
);

// A doctor's patients, newest first. Also used to count patients per doctor.
patientSchema.index({ doctor: 1, createdAt: -1 });

// Filter by condition, newest first
patientSchema.index({ condition: 1, createdAt: -1 });

// Filter by gender
patientSchema.index({ gender: 1, createdAt: -1 });

// Date filter, default sort, and dashboard date stats
patientSchema.index({ createdAt: -1 });

// Text search on name and condition
patientSchema.index(
  { name: "text", condition: "text" },
  { weights: { name: 5, condition: 2 } }
);

export const Patient = model<IPatient>("Patient", patientSchema);