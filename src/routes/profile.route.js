import express from "express";
const router = express.Router();
import {
  createProfile,
  deleteProfileById,
  getAllProfile,
  getProfileById,
  updateProfileById,
} from "../controllers/profile.controller.js";
import {
  middlewareCreateProfile,
  middlewareDeleteProfileById,
} from "../middlewares/profile.middleware.js";
import { auth } from "../middlewares/auth.middleware.js";
import { upload } from "../utils/file.util.js";
router.get("/", getAllProfile);
router.get("/user-profile", auth, getProfileById);
router.post("/", middlewareCreateProfile, createProfile);
router.put("/", upload.single("profileImage"), auth, updateProfileById);
router.delete("/:id", middlewareDeleteProfileById, deleteProfileById);
export default router;
