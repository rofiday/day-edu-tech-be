import { upload } from "../utils/file.util.js";
import express from "express";
import {
  createCourse,
  deleteCourseById,
  getAllCourse,
  updateCourseById,
  getUserCourses,
  getAllAvailableCourses,
  getCourseByIdLms,
  getCourseByIdProtected,
  getCourseByIdPublic,
} from "../controllers/course.controller.js";

import {
  addCourseToCart,
  deleteCourseFromCart,
  getAllCourseFromCart,
  updateUserCart,
} from "../controllers/cart.controller.js";

import { auth, forgeDecryptPayload } from "../middlewares/auth.middleware.js";

import {
  middlewareCreateCourse,
  middlewareDeleteCourseById,
  middlewareGetCourseById,
  middlewareGetUserCourse,
  middlewareUpdateCourseById,
} from "../middlewares/course.middleware.js";
import {
  middlewareAddToCart,
  middlewareDeleteFromCart,
} from "../middlewares/cart.middleware.js";
const router = express.Router();

router.put("/carts", auth, updateUserCart);
router.get("/cart", auth, getAllCourseFromCart);
router.post(
  "/cart",
  forgeDecryptPayload,
  auth,
  middlewareAddToCart,
  addCourseToCart
);
router.delete(
  "/cart",
  forgeDecryptPayload,
  auth,
  middlewareDeleteFromCart,
  deleteCourseFromCart
);
router.get("/", getAllCourse);
router.get("/lms/:id", auth, getCourseByIdLms);
router.get("/user", auth, middlewareGetUserCourse, getUserCourses);
router.get("/search", auth, getAllAvailableCourses);
router.get(
  "/protected/:id",
  auth,
  middlewareGetCourseById,
  getCourseByIdProtected
);
router.get("/public/:id", middlewareGetCourseById, getCourseByIdPublic);
router.post(
  "/",
  upload.single("urlImage"),
  auth,
  middlewareCreateCourse,
  createCourse
);
router.put(
  "/:id",
  upload.single("urlImage"),
  auth,
  middlewareUpdateCourseById,
  updateCourseById
);
router.delete("/:id", auth, middlewareDeleteCourseById, deleteCourseById);
export default router;
