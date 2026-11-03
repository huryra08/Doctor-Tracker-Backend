import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DashboardServices } from "./dashboard.service";


// Keeps a query number between 1 and max, with a fallback
const toNumber = (value: unknown, fallback: number, max: number) => {
  const n = Number(value);
  if (!n || n < 1) return fallback;
  return Math.min(Math.floor(n), max);
};

const getSummary = catchAsync(async (_req, res) => {
  const data = await DashboardServices.getSummary();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Dashboard summary fetched",
    data,
  });
});

const getPatientsPerDoctor = catchAsync(async (req, res) => {
  const data = await DashboardServices.getPatientsPerDoctor(
    toNumber(req.query.limit, 10, 50)
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patients per doctor fetched",
    data,
  });
});

const getPatientsByCondition = catchAsync(async (_req, res) => {
  const data = await DashboardServices.getPatientsByCondition();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patients by condition fetched",
    data,
  });
});

const getPatientsByGender = catchAsync(async (_req, res) => {
  const data = await DashboardServices.getPatientsByGender();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Patients by gender fetched",
    data,
  });
});

const getDoctorsBySpecialization = catchAsync(async (_req, res) => {
  const data = await DashboardServices.getDoctorsBySpecialization();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Doctors by specialization fetched",
    data,
  });
});

const getPatientsDaily = catchAsync(async (req, res) => {
  const data = await DashboardServices.getPatientsDaily(
    toNumber(req.query.days, 30, 365)
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Daily patient statistics fetched",
    data,
  });
});

const getMonthlyGrowth = catchAsync(async (req, res) => {
  const data = await DashboardServices.getMonthlyGrowth(
    toNumber(req.query.months, 6, 24)
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Monthly growth fetched",
    data,
  });
});

const getRecentPatients = catchAsync(async (req, res) => {
  const data = await DashboardServices.getRecentPatients(
    toNumber(req.query.limit, 5, 20)
  );
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Recent patients fetched",
    data,
  });
});

export const DashboardControllers = {
  getSummary,
  getPatientsPerDoctor,
  getPatientsByCondition,
  getPatientsByGender,
  getDoctorsBySpecialization,
  getPatientsDaily,
  getMonthlyGrowth,
  getRecentPatients,
};