import { Router } from "express";
import auth from "../../middleware/auth";
import validateRequest from "../../middleware/validateRequest";
import { PatientControllers } from "../patient/patient.controller";
import { PatientValidation } from "../patient/patient.validation";
import { DoctorControllers } from "./doctor.controller";
import { DoctorValidation } from "./doctor.validation";

const router = Router();

router.use(auth("admin"));

router.get("/filter-options", DoctorControllers.getFilterOptions);

router.post(
  "/",
  validateRequest(DoctorValidation.createDoctorValidationSchema),
  DoctorControllers.createDoctor
);

router.get("/", DoctorControllers.getAllDoctors);

// Nested: a doctor's patients
router.get("/:id/patients", PatientControllers.getPatientsByDoctor);

router.post(
  "/:id/patients",
  validateRequest(PatientValidation.createPatientForDoctorValidationSchema),
  PatientControllers.createPatientForDoctor
);

router.delete("/:id/patients/:patientId", PatientControllers.deletePatientOfDoctor);

router.get("/:id", DoctorControllers.getDoctorById);

router.patch(
  "/:id",
  validateRequest(DoctorValidation.updateDoctorValidationSchema),
  DoctorControllers.updateDoctor
);

router.delete("/:id", DoctorControllers.deleteDoctor);

export const DoctorRoutes = router;