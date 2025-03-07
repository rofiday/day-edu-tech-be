import express from "express";
import {
  createUser,
  deleteUserById,
  getAllUser,
  getUserById,
  updateUserById,
} from "../controllers/user.controller.js";
import {
  middlewarecreateUser,
  middlewareDeleteUserById,
  middlewareGetUserById,
  middlewareUpdateUser,
} from "../middlewares/user.middleware.js";
import { auth, forgeDecryptPayload } from "../middlewares/auth.middleware.js";
const router = express.Router();

router.get("/", auth, getAllUser);
router.get("/:id", auth, middlewareGetUserById, getUserById);
router.post("/", forgeDecryptPayload, auth, middlewarecreateUser, createUser);
router.put("/:id", forgeDecryptPayload, middlewareUpdateUser, updateUserById);
router.delete("/:id", middlewareDeleteUserById, deleteUserById);
export default router;
