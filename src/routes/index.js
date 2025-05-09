import express from "express";
const router = express.Router();
import userRoute from "./user.route.js";
import profileRoute from "./profile.route.js";
import authRoute from "./auth.route.js";
import courseRoute from "./course.route.js";
import curriculumRoute from "./curriculum.route.js";
import sectionRoute from "./section.route.js";
import transactionRoute from "./transaction.route.js";

router.use("/users", userRoute);
router.use("/profiles", profileRoute);
router.use("/auth", authRoute);
router.use("/courses", courseRoute);
router.use("/sections", sectionRoute);
router.use("/curriculums", curriculumRoute);
router.use("/transaction", transactionRoute);
export default router;
