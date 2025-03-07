import db from "../models/index.js";
const { Course, User, Section, Curriculum, UserCourse, Cart, Order } = db;
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
export const getAllAvailableCourses = async (req, res) => {
  const { q } = req.query;
  try {
    const courses = await Course.findAndCountAll({
      where: {
        [Op.or]: [{ name: { [Op.like]: `%${q.toLowerCase()}%` } }],
      },
      limit: 5,
      orderBy: [["createdAt", "DESC"]],
    });
    res.status(200).json({
      status: "success",
      count: courses.count,
      data: courses.rows,
      message: "Courses retrieved successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const getUserCourses = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await User.findByPk(id, {
      include: [
        {
          model: Course,
          as: "courses",
          attributes: [
            "id",
            "name",
            "code",
            "description",
            "urlImage",
            "isActive",
          ],
          through: { attributes: [] },
        },
      ],
    });
    res.status(200).json({
      status: "success",
      data: user.courses,
      message: "Courses retrieved successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
export const getAllCourse = async (req, res) => {
  const { limit = 10, offset = 0, search = "" } = req.query;
  try {
    const courses = await Course.findAndCountAll({
      where: {
        [Op.or]: [{ name: { [Op.like]: `%${search.toLowerCase()}%` } }],
      },

      orderBy: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset: Number(offset),
    });
    res.status(200).json({
      status: "success",
      count: courses.count,
      limit,
      data: courses.rows,
      message: "Courses retrieved successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const getCourseByIdPublic = async (req, res) => {
  const { id } = req.params;
  try {
    console.log("PUBLIC", id);
    const course = await Course.findOne({
      where: { id },
      include: [
        {
          model: Section,
          as: "sections",
          attributes: ["title"],
          include: [
            {
              model: Curriculum,
              as: "curriculums",
              attributes: ["id", "title", "contents"],
            },
          ],
        },
      ],
    });
    if (!course) {
      return res.status(400).json({
        status: "error",
        message: "Course not found",
      });
    }
    let isAvailableCourse = true;
    return res.status(200).json({
      status: "success",
      data: {
        ...course.toJSON(),
        isAvailableCourse,
      },
      message: "Course retrieved successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
export const getCourseByIdProtected = async (req, res) => {
  const { id } = req.params;
  try {
    console.log(id);
    const course = await Course.findOne({
      where: { id },
      include: [
        {
          model: Section,
          as: "sections",
          attributes: ["title"],
          include: [
            {
              model: Curriculum,
              as: "curriculums",
              attributes: ["id", "title", "contents"],
            },
          ],
        },
      ],
    });
    if (!course) {
      return res.status(400).json({
        status: "error",
        message: "Course not found",
      });
    }
    let isAvailableCourse = true;
    const existingCartItem = await Cart.findOne({
      where: {
        userId: req.user.id,
        courseId: id,
      },
    });
    if (existingCartItem) {
      isAvailableCourse = false;
    }
    const userCourses = await UserCourse.findAll({
      where: {
        userId: req.user.id,
        courseId: id,
      },
    });
    if (userCourses && userCourses.length > 0) {
      isAvailableCourse = false;
    }

    const orders = await Order.findAll({
      where: {
        userId: req.user.id,
        paymentStatus: "pending",
        status: "pending",
      },
    });
    await Promise.all(
      orders?.map(async (order) => {
        await Promise.all(
          order.data.map(async (course) => {
            if (course.id === id) {
              isAvailableCourse = false;
            }
          })
        );
      })
    );
    res.status(200).json({
      status: "success",
      data: {
        ...course.toJSON(),
        isAvailableCourse,
      },
      message: "Course retrieved successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const getCourseByIdLms = async (req, res) => {
  const { id } = req.params;
  try {
    const userCourses = await UserCourse.findAll({
      attributes: ["courseId"],
      where: { userId: req.user.id },
    });
    console.log("userCourses", userCourses);
    console.log("id", id);
    const isValidData = userCourses.find((course) => course.courseId === id);
    if (!isValidData) {
      return res.status(404).json({
        status: "error",
        message: "Course not available for this user!",
      });
    }
    const course = await Course.findOne({
      where: { id },
      include: [
        {
          model: Section,
          as: "sections",
          attributes: ["title"],
          include: [
            {
              model: Curriculum,
              as: "curriculums",
              attributes: ["id", "title", "contents"],
            },
          ],
        },
      ],
    });
    res.status(200).json({
      status: "success",
      data: course,
      message: "Successfully get course lms by Id",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const createCourse = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }
    const course = await Course.create({
      id: uuidv4(),
      ...req.body,
      urlImage: `/assets/images/courses/${req.file.filename}`,
    });
    res.status(201).json({
      status: "success",
      data: course,
      message: "Create course successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const updateCourseById = async (req, res) => {
  const { id } = req.params;
  console.log(req.file);
  try {
    console.log("coreapi", req);
    req.body.data = {};
    const course = await Course.findOne({
      where: { id },
    });
    if (!course) {
      return res.status(400).json({
        status: "error",
        message: "Course not found",
      });
    }
    if (req.file) {
      await course.update({
        ...req.body,
        urlImage: `/assets/images/courses/${req.file.filename}`,
      });
    } else {
      await course.update({
        ...req.body,
      });
    }
    res.status(200).json({
      status: "success",
      data: course,
      message: "Course updated successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const deleteCourseById = async (req, res) => {
  const { id } = req.params;
  try {
    console.log("id", id);
    const course = await Course.findOne({
      where: { id },
    });
    if (!course) {
      return res.status(400).json({
        status: "error",
        message: "Course not found",
      });
    }
    await course.destroy();
    res.status(200).json({
      status: "success",
      message: "Course deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
