import { Router } from "express";
import { AuthRoutes } from "../module/auth/auth.route";
import { DoctorRoutes } from "../module/doctor/doctor.route";
import { PatientRoutes } from "../module/patient/patient.route";
import { DashboardRoutes } from "../module/dashboard/dashboard.route";

const router = Router();

const moduleRoutes = [
  { path: "/auth", route: AuthRoutes },
  { path: "/doctors", route: DoctorRoutes },
  { path: "/patients", route: PatientRoutes },
  { path: "/dashboard", route: DashboardRoutes },
];

moduleRoutes.forEach((item) => router.use(item.path, item.route));

export default router;