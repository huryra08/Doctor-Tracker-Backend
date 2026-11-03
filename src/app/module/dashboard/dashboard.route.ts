import { Router } from "express";
import auth from "../../middleware/auth";
import { DashboardControllers } from "./dashboard.controller";

const router = Router();

router.use(auth("admin"));

router.get("/summary", DashboardControllers.getSummary);
router.get("/patients-per-doctor", DashboardControllers.getPatientsPerDoctor);
router.get("/patients-by-condition", DashboardControllers.getPatientsByCondition);
router.get("/patients-by-gender", DashboardControllers.getPatientsByGender);
router.get(
  "/doctors-by-specialization",
  DashboardControllers.getDoctorsBySpecialization
);
router.get("/patients-daily", DashboardControllers.getPatientsDaily);
router.get("/monthly-growth", DashboardControllers.getMonthlyGrowth);
router.get("/recent-patients", DashboardControllers.getRecentPatients);

export const DashboardRoutes = router;