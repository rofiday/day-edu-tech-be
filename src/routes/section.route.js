import {
  middlewareCreateSection,
  middlewareDeleteSectionById,
  middlewareGetSectionById,
  middlewareUpdateSectionById,
} from "../middlewares/section.middleware.js";
import {
  createSection,
  deleteSectionById,
  getAllSection,
  getSectionById,
  updateSectionById,
  getAllAvailableSections,
} from "../controllers/section.controller.js";
import { auth, forgeDecryptPayload } from "../middlewares/auth.middleware.js";
import express from "express";
const router = express.Router();

router.get("/search", auth, getAllAvailableSections);
router.get("/", auth, getAllSection);
router.get("/:id", auth, middlewareGetSectionById, getSectionById);
router.post(
  "/",
  forgeDecryptPayload,
  auth,
  middlewareCreateSection,
  createSection
);
router.put(
  "/:id",
  forgeDecryptPayload,
  auth,
  middlewareUpdateSectionById,
  updateSectionById
);
router.delete("/:id", auth, middlewareDeleteSectionById, deleteSectionById);
export default router;
