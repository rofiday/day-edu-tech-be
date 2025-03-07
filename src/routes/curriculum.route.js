import { auth, forgeDecryptPayload } from "../middlewares/auth.middleware.js";
import {
  createCurriculum,
  deleteCurriculumById,
  getAllCurriculum,
  getCurriculumById,
  updateCurriculumById,
} from "../controllers/curriculum.controller.js";
import express from "express";
import {
  middlewareCreateCurriculum,
  middlewareDeleteCurriculumById,
  middlewareGetCurriculumById,
  middlewareUpdateCurriculumById,
} from "../middlewares/curriculum.middleware.js";
const router = express.Router();

router.get("/", auth, getAllCurriculum);
router.get("/:id", auth, middlewareGetCurriculumById, getCurriculumById);
router.post(
  "/",
  forgeDecryptPayload,
  auth,
  middlewareCreateCurriculum,
  createCurriculum
);
router.put(
  "/:id",
  forgeDecryptPayload,
  auth,
  middlewareUpdateCurriculumById,
  updateCurriculumById
);
router.delete(
  "/:id",
  auth,
  middlewareDeleteCurriculumById,
  deleteCurriculumById
);
export default router;
