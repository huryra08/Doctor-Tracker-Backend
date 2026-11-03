import httpStatus from "http-status";
import { QueryFilter, Types } from "mongoose";
import AppError from "../../utils/AppError";
import {
  buildMeta,
  escapeRegex,
  getPagination,
} from "../../utils/queryBuilder";
import { IDoctor } from "./doctor.interface";
import { Doctor } from "./doctor.model";
import { Patient } from "../patient/patient.model";

const SORT_FIELDS = ["createdAt", "name", "specialization", "hospital"];

const createDoctor = async (payload: IDoctor) => {
  return Doctor.create(payload);
};

const getAllDoctors = async (query: Record<string, unknown>) => {
  const { page, limit, skip, sort } = getPagination(query, SORT_FIELDS);

  const filter: QueryFilter<IDoctor> = {};

  // Search: uses the text index for full words
  const search = String(query.search || "").trim();
  if (search) {
    filter.$text = { $search: search };
  }

  // Exact filters (use the compound indexes)
  if (query.specialization) {
    filter.specialization = new RegExp(
      `^${escapeRegex(String(query.specialization))}$`,
      "i"
    );
  }
  if (query.hospital) {
    filter.hospital = new RegExp(
      `^${escapeRegex(String(query.hospital))}$`,
      "i"
    );
  }

  // Date-wise filter on createdAt
  const { from, to } = query as { from?: string; to?: string };
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const [data, total] = await Promise.all([
    Doctor.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Doctor.countDocuments(filter),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

const getDoctorById = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid doctor id");
  }
  const doctor = await Doctor.findById(id).lean();
  if (!doctor) {
    throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
  }
  return doctor;
};

const updateDoctor = async (id: string, payload: Partial<IDoctor>) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid doctor id");
  }
  const doctor = await Doctor.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  }).lean();
  if (!doctor) {
    throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
  }
  return doctor;
};

// Distinct values to fill the filter dropdowns on the frontend
const getFilterOptions = async () => {
  const [specializations, hospitals] = await Promise.all([
    Doctor.distinct("specialization"),
    Doctor.distinct("hospital"),
  ]);
  return {
    specializations: specializations.sort(),
    hospitals: hospitals.sort(),
  };
};

const deleteDoctor = async (id: string) => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, "Invalid doctor id");
  }

  const patientCount = await Patient.countDocuments({ doctor: id });
  if (patientCount > 0) {
    throw new AppError(
      httpStatus.CONFLICT,
      `Cannot delete doctor with ${patientCount} patient(s). Remove or reassign them first.`
    );
  }

  const doctor = await Doctor.findByIdAndDelete(id).lean();
  if (!doctor) {
    throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
  }
  return doctor;
};

export const DoctorServices = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getFilterOptions,
};