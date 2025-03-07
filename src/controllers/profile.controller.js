import db from "../models/index.js";
const { User, Profile } = db;
import { v4 as uuidv4 } from "uuid";
export const getAllProfile = async (req, res) => {
  try {
    const profiles = await Profile.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "fullname"],
        },
      ],
    });

    res.status(200).json({
      status: "success",
      data: profiles,
      message: "Profiles retrieved successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const getProfileById = async (req, res) => {
  const { id } = req.user;
  try {
    const profile = await Profile.findOne({
      where: { userId: id },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "fullname"],
        },
      ],
    });
    if (!profile)
      return res
        .status(404)
        .json({ status: "error", message: "Profile not found" });
    res.status(200).json({
      status: "success",
      data: profile,
      message: "Profile retrieved successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const createProfile = async (req, res) => {
  try {
    const profile = await Profile.create({
      id: uuidv4(),
      ...req.body,
    });
    res.status(201).json({
      status: "success",
      data: profile,
      message: "Profile created successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const updateProfileById = async (req, res) => {
  const { id } = req.user;
  try {
    const profile = await Profile.findOne({
      where: { userId: id },
    });
    if (req.body.socialLinks) {
      req.body.socialLinks = JSON.parse(req.body.socialLinks);
    }
    if (req.file) {
      await profile.update({
        ...req.body,
        profileImage: `/assets/images/profiles/${req.file.filename}`,
      });
    } else {
      await profile.update({
        ...req.body,
      });
    }
    res.status(200).json({
      status: "success",
      data: profile,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const deleteProfileById = async (req, res) => {
  const { id } = req.params;
  try {
    const profile = await Profile.findOne({
      where: { id },
    });
    await profile.destroy();
    res.status(200).json({
      status: "success",
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
