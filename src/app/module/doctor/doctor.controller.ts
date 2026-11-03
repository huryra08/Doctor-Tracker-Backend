import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DoctorServices } from "./doctor.service";

const createDoctor = catchAsync(async (req, res) => {
  const result = await DoctorServices.createDoctor(req.body);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: "Doctor created successfully",
    data: result,
  });
});

const getAllDoctors = catchAsync(async (req, res) => {
  const { data, meta } = await DoctorServices.getAllDoctors(req.query);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctors fetched successfully",
    meta,
    data,
  });
});

const getDoctorById = catchAsync(async (req, res) => {
  const result = await DoctorServices.getDoctorById(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor fetched successfully",
    data: result,
  });
});

const updateDoctor = catchAsync(async (req, res) => {
  const result = await DoctorServices.updateDoctor(
    req.params.id as string,
    req.body
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor updated successfully",
    data: result,
  });
});

const getFilterOptions = catchAsync(async (_req, res) => {
  const result = await DoctorServices.getFilterOptions();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Filter options fetched successfully",
    data: result,
  });
});

const deleteDoctor = catchAsync(async (req, res) => {
  const result = await DoctorServices.deleteDoctor(req.params.id as string);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctor deleted successfully",
    data: result,
  });
});

export const DoctorControllers = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getFilterOptions,
};