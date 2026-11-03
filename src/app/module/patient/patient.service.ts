import httpStatus from "http-status";
import { QueryFilter, Types } from "mongoose";
import AppError from "../../utils/AppError";
import {
  buildMeta,
  escapeRegex,
  getPagination,
} from "../../utils/queryBuilder";
import { Doctor } from "../doctor/doctor.model";
import { IPatient } from "./patient.interface";
import { Patient } from "./patient.model";

const SORT_FIELDS = ["createdAt", "name", "age", "condition"];

const assertValidId = (id: string, label = "id") => {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(httpStatus.BAD_REQUEST, `Invalid ${label}`);
  }
};

const assertDoctorExists = async (doctorId: string) => {
  assertValidId(doctorId, "doctor id");
  const exists = await Doctor.exists({ _id: doctorId });
  if (!exists) {
    throw new AppError(httpStatus.NOT_FOUND, "Doctor not found");
  }
};

// Shared by the main patient list and the doctor's patient list
const buildPatientFilter = (query: Record<string, unknown>) => {
  const filter: QueryFilter<IPatient> = {};

  const search = String(query.search || "").trim();
  if (search) {
    filter.$text = { $search: search };
  }

  if (query.condition) {
    filter.condition = new RegExp(
      `^${escapeRegex(String(query.condition))}$`,
      "i"
    );
  }

  if (query.gender) {
    filter.gender = String(query.gender) as IPatient["gender"];
  }

  if (query.doctor && Types.ObjectId.isValid(String(query.doctor))) {
    filter.doctor = new Types.ObjectId(String(query.doctor));
  }

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

  return filter;
};

const listPatients = async (
  query: Record<string, unknown>,
  forcedFilter: QueryFilter<IPatient> = {}
) => {
  const { page, limit, skip, sort } = getPagination(query, SORT_FIELDS);
  const filter = { ...buildPatientFilter(query), ...forcedFilter };

  const [data, total] = await Promise.all([
    Patient.find(filter)
      .populate("doctor", "name specialization hospital")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean(),
    Patient.countDocuments(filter),
  ]);

  return { data, meta: buildMeta(page, limit, total) };
};

// Main patient page
const getAllPatients = async (query: Record<string, unknown>) => {
  return listPatients(query);
};

// Doctor page: that doctor's patients
const getPatientsByDoctor = async (
  doctorId: string,
  query: Record<string, unknown>
) => {
  await assertDoctorExists(doctorId);
  return listPatients(query, { doctor: new Types.ObjectId(doctorId) });
};

const createPatient = async (payload: Omit<IPatient, "doctor"> & { doctor: string }) => {
  await assertDoctorExists(payload.doctor);
  return Patient.create(payload);
};

const createPatientForDoctor = async (
  doctorId: string,
  payload: Omit<IPatient, "doctor">
) => {
  await assertDoctorExists(doctorId);
  return Patient.create({ ...payload, doctor: doctorId });
};

const getPatientById = async (id: string) => {
  assertValidId(id, "patient id");
  const patient = await Patient.findById(id)
    .populate("doctor", "name specialization hospital")
    .lean();
  if (!patient) {
    throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
  }
  return patient;
};

const updatePatient = async (
  id: string,
  payload: Partial<Omit<IPatient, "doctor">> & { doctor?: string }
) => {
  assertValidId(id, "patient id");
  if (payload.doctor) {
    await assertDoctorExists(payload.doctor);
  }
  const patient = await Patient.findByIdAndUpdate(id, payload, {
    new: true,
    runValidators: true,
  })
    .populate("doctor", "name specialization hospital")
    .lean();
  if (!patient) {
    throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
  }
  return patient;
};

const deletePatient = async (id: string) => {
  assertValidId(id, "patient id");
  const patient = await Patient.findByIdAndDelete(id).lean();
  if (!patient) {
    throw new AppError(httpStatus.NOT_FOUND, "Patient not found");
  }
  return patient;
};

// Delete a patient only if they belong to this doctor
const deletePatientOfDoctor = async (doctorId: string, patientId: string) => {
  assertValidId(doctorId, "doctor id");
  assertValidId(patientId, "patient id");
  const patient = await Patient.findOneAndDelete({
    _id: patientId,
    doctor: doctorId,
  }).lean();
  if (!patient) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Patient not found under this doctor"
    );
  }
  return patient;
};

// Distinct conditions for the filter dropdown
const getFilterOptions = async () => {
  const conditions = await Patient.distinct("condition");
  return { conditions: conditions.sort() };
};

export const PatientServices = {
  getAllPatients,
  getPatientsByDoctor,
  createPatient,
  createPatientForDoctor,
  getPatientById,
  updatePatient,
  deletePatient,
  deletePatientOfDoctor,
  getFilterOptions,
};