import db from "../models/index.js";
const { Section } = db;
import { Op } from "sequelize";
import Joi from "joi";

export const middlewareCreateSection = async (req, res, next) => {
  try {
    const schema = Joi.object({
      title: Joi.string().required(),
      courseId: Joi.string().required(),
      // courseName: Joi.string().required(),
      // data: Joi.string().required(),
      isActive: Joi.boolean().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }
    const section = await Section.findOne({
      where: {
        [Op.or]: {
          title: req.body.title,
        },
      },
    });
    if (section) {
      return res.status(400).json({
        status: "error",
        message: "Section with the same title and course already exists",
      });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

export const middlewareGetSectionById = async (req, res, next) => {
  try {
    const section = await Section.findOne({
      where: {
        id: req.params.id,
      },
    });
    if (!section) {
      return res.status(404).json({
        status: "error",
        message: "Section not found",
      });
    }
    req.section = section;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

export const middlewareUpdateSectionById = async (req, res, next) => {
  try {
    const schema = Joi.object({
      title: Joi.string().required(),
      courseId: Joi.string().required(),
      courseName: Joi.string().required(),
      isActive: Joi.boolean().required(),
    });
    console.log(schema);
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }
    const section = await Section.findByPk(req.params.id);
    if (!section) {
      return res.status(404).json({
        status: "error",
        message: "Section not found",
      });
    }
    req.section = section;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};

export const middlewareDeleteSectionById = async (req, res, next) => {
  try {
    const section = await Section.findByPk(req.params.id);
    if (!section) {
      return res.status(404).json({
        status: "error",
        message: "Section not found",
      });
    }
    req.section = section;
    next();
  } catch (error) {
    console.error(error);
    res.status(500).send(error.message);
  }
};
