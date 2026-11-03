import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { PatientServices } from "./patient.service";

const getAllPatients = catchAsync(async (req, res) => {
  const { data, meta } = await PatientServices.getAllPatients(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patients fetched successfully",
    meta,
    data,
  });
});

const getPatientsByDoctor = catchAsync(async (req, res) => {
  const { data, meta } = await PatientServices.getPatientsByDoctor(
    req.params.id as string,
    req.query
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor's patients fetched successfully",
    meta,
    data,
  });
});

const createPatient = catchAsync(async (req, res) => {
  const result = await PatientServices.createPatient(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Patient created successfully",
    data: result,
  });
});

const createPatientForDoctor = catchAsync(async (req, res) => {
  const result = await PatientServices.createPatientForDoctor(
    req.params.id as string,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Patient added under doctor successfully",
    data: result,
  });
});

const getPatientById = catchAsync(async (req, res) => {
  const result = await PatientServices.getPatientById(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient fetched successfully",
    data: result,
  });
});

const updatePatient = catchAsync(async (req, res) => {
  const result = await PatientServices.updatePatient(
    req.params.id as string,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient updated successfully",
    data: result,
  });
});

const deletePatient = catchAsync(async (req, res) => {
  const result = await PatientServices.deletePatient(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient deleted successfully",
    data: result,
  });
});

const deletePatientOfDoctor = catchAsync(async (req, res) => {
  const result = await PatientServices.deletePatientOfDoctor(
    req.params.id as string,
    req.params.patientId as string
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patient removed from doctor successfully",
    data: result,
  });
});

const getFilterOptions = catchAsync(async (_req, res) => {
  const result = await PatientServices.getFilterOptions();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Filter options fetched successfully",
    data: result,
  });
});

export const PatientControllers = {
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