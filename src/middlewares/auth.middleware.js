import dotenv from "dotenv";
dotenv.config();
import db from "../models/index.js";
const { User } = db;
import jwt from "jsonwebtoken";
import { decryptPayload } from "../utils/forge.util.js";
import Joi from "joi";
export const forgeDecryptPayload = async (req, res, next) => {
  try {
    req.body = decryptPayload(req.body);
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
export const auth = (req, res, next) => {
  try {
    console.log("req.body:: ", req.body);
    const token = req.cookies[process.env.COOKIE_NAME];
    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const authAdmin = (req, res, next) => {
  try {
    const token = req.cookies[process.env.COOKIE_NAME];
    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }
    const user = jwt.verify(token, process.env.JWT_SECRET);
    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }
    req.user = user;
    if (user.roleName !== "admin") {
      return res.status(401).json({
        status: "error",
        message: "Unauthorized",
      });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const middlewareAuthRegister = async (req, res, next) => {
  try {
    const schema = Joi.object({
      fullname: Joi.string().required(),
      username: Joi.string().required(),
      phoneNumber: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
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
          username: req.body.username,
          phoneNumber: req.body.phoneNumber,
          email: req.body.email,
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

export const middlewareAuthlogin = async (req, res, next) => {
  try {
    const schema = Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
