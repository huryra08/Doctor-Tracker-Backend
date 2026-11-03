import { Schema, model } from "mongoose";
import { IDoctor } from "./doctor.interface";

const doctorSchema = new Schema<IDoctor>(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    hospital: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Text search across name, specialization and hospital
doctorSchema.index(
  { name: "text", specialization: "text", hospital: "text" },
  { weights: { name: 5, specialization: 3, hospital: 1 } }
);

// Filter by specialization or hospital, newest first
doctorSchema.index({ specialization: 1, createdAt: -1 });
doctorSchema.index({ hospital: 1, createdAt: -1 });

// Date filter and default sort
doctorSchema.index({ createdAt: -1 });

export const Doctor = model<IDoctor>("Doctor", doctorSchema);