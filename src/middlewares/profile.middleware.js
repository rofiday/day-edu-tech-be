import db from "../models/index.js";
const { Profile } = db;
import Joi from "joi";
import { Op } from "sequelize";

export const middlewareGetProfileById = async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await Profile.findOne({
      where: { id },
    });
    if (!profile) {
      return res.status(500).json({
        status: "error",
        message: "Profile is not found",
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const middlewareCreateProfile = async (req, res) => {
  const { userId, bio, profileImage, address, gender, birthDate, socialLinks } =
    req.body;
  try {
    const schema = Joi.object({
      userId: Joi.string().required(),
      bio: Joi.string().required(),
      profileImage: Joi.string().uri().required(),
      address: Joi.string().required(),
      gender: Joi.string().valid("male", "female").required(),
      birthDate: Joi.date().less("now").required(),
      socialLinks: Joi.object({
        twitter: Joi.string().uri().optional(),
        facebook: Joi.string().uri().optional(),
        instagram: Joi.string().uri().optional(),
      })
        .or("twitter", "facebook", "instagram")
        .required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }
    const profile = await Profile.findOne({
      where: {
        [Op.or]: {
          userId: userId,
          bio: bio,
          profileImage: profileImage,
          address: address,
          gender: gender,
          birthDate: birthDate,
          socialLinks: socialLinks,
        },
      },
    });
    if (profile) {
      return res.status(400).json({
        status: "error",
        message: "Profile already exists",
      });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const middlewareUpdateProfileById = async (req, res) => {
  const { id } = req.params;
  try {
    const schema = Joi.object({
      userId: Joi.string().required(),
      bio: Joi.string().required(),
      profileImage: Joi.string().uri().required(),
      address: Joi.string().required(),
      gender: Joi.string().valid("male", "female").required(),
      birthDate: Joi.date().less("now").required(),
      socialLinks: Joi.object({
        twitter: Joi.string().uri().optional(),
        facebook: Joi.string().uri().optional(),
        instagram: Joi.string().uri().optional(),
      })
        .or("twitter", "facebook", "instagram")
        .required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }
    const profile = await Profile.findOne({
      where: { id },
    });
    if (!profile) {
      return res.status(400).json({
        status: "error",
        message: "Profile is not found",
      });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const middlewareDeleteProfileById = async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await Profile.findOne({
      where: { id },
    });
    if (!profile) {
      return res.status(500).json({
        status: "error",
        message: "Profile is not found",
      });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
