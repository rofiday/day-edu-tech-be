import express from "express";
import {
  continueWithGoogle,
  forgotPassword,
  login,
  logout,
  register,
  resetPassword,
  verifyEmail,
} from "../controllers/auth.controller.js";
import { generateSessionKey } from "../utils/forge.util.js";
import {
  forgeDecryptPayload,
  middlewareAuthlogin,
  middlewareAuthRegister,
} from "../middlewares/auth.middleware.js";
const router = express.Router();

router.post("/continue-with-google", continueWithGoogle);
router.post("/login-postman", login);
router.post("/login", forgeDecryptPayload, middlewareAuthlogin, login);
router.post("/register", forgeDecryptPayload, middlewareAuthRegister, register);
router.post("/logout", logout);
router.get("/verify-email", verifyEmail);
router.post("/forgot-password", forgeDecryptPayload, forgotPassword);
router.post("/reset-password", forgeDecryptPayload, resetPassword);
router.get("/session", generateSessionKey);
export default router;
