import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { PatientControllers } from "./patient.controller";
import { PatientValidation } from "./patient.validation";

const router = Router();

router.use(auth("admin"));

router.get("/filter-options", PatientControllers.getFilterOptions);

router.post(
  "/",
  validateRequest(PatientValidation.createPatientValidationSchema),
  PatientControllers.createPatient
);

router.get("/", PatientControllers.getAllPatients);

router.get("/:id", PatientControllers.getPatientById);

router.patch(
  "/:id",
  validateRequest(PatientValidation.updatePatientValidationSchema),
  PatientControllers.updatePatient
);

router.delete("/:id", PatientControllers.deletePatient);

export const PatientRoutes = router;