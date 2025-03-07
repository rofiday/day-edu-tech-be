import db from "../models/index.js";
const { User } = db;
import Joi from "joi";
import { Op } from "sequelize";
export const middlewareGetUserById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      where: { id },
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

export const middlewarecreateUser = async (req, res, next) => {
  const { username, phoneNumber, email } = req.body;
  try {
    const schema = Joi.object({
      fullname: Joi.string().required(),
      username: Joi.string().required(),
      phoneNumber: Joi.string().required(),
      email: Joi.string().email().required(),
      roleName: Joi.string().required(),
      courses: Joi.array().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }
    const user = await User.findOne({
      where: {
        [Op.or]: {
          username: username,
          phoneNumber: phoneNumber,
          email: email,
        },
      },
    });
    if (user) {
      return res.status(400).json({
        status: "error",
        message: "User already exists",
      });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
export const middlewareUpdateUser = async (req, res, next) => {
  const { id } = req.params;
  try {
    console.log("user:: ", req.body);
    const schema = Joi.object({
      fullname: Joi.string().required(),
      username: Joi.string().required(),
      phoneNumber: Joi.string().required(),
      email: Joi.string().email().required(),
      roleName: Joi.string().required(),
      courses: Joi.array().required(),
    });
    console.log(schema);
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }
    const user = await User.findOne({
      where: { id },
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
export const middlewareDeleteUserById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      where: { id },
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
