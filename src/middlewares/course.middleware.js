import db from "../models/index.js";
const { Course, User } = db;
import Joi from "joi";
import { Op } from "sequelize";

export const middlewareGetUserCourse = async (req, res, next) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
    });
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User is not found",
      });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const middlewareGetCourseById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const course = await Course.findOne({
      where: { id },
    });
    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course is not found",
      });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const middlewareCreateCourse = async (req, res, next) => {
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      code: Joi.string().required(),
      type: Joi.string()
        .valid("bootcamp", "content course", "mini bootcamp", "1on1 mentoring")
        .required(),
      folder: Joi.string().required(),
      description: Joi.string().required(),
      price: Joi.number().required(),
      data: Joi.string().required(),
      // urlImage: Joi.string().required(),
      isActive: Joi.boolean().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }
    const course = await Course.findOne({
      where: {
        [Op.or]: {
          name: req.body.name,
          code: req.body.code,
        },
      },
    });
    if (course) {
      return res.status(400).json({
        status: "error",
        message: "Course already exists",
      });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const middlewareUpdateCourseById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      code: Joi.string().required(),
      type: Joi.string()
        .valid("bootcamp", "content course", "mini bootcamp", "1on1 mentoring")
        .required(),
      folder: Joi.string().required(),
      description: Joi.string().required(),
      price: Joi.number().required(),
      // urlImage: Joi.string().required(),
      isActive: Joi.boolean().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }
    const course = await Course.findOne({
      where: { id },
    });
    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course is not found",
      });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const middlewareDeleteCourseById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const course = await Course.findOne({
      where: { id },
    });
    if (!course) {
      return res.status(404).json({
        status: "error",
        message: "Course is not found",
      });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
