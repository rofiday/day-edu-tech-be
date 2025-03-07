import db from "../models/index.js";
const { Curriculum, Section } = db;
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";

export const getAllCurriculum = async (req, res) => {
  const { limit = 10, offset = 0, search = "" } = req.query;
  try {
    const curriculums = await Curriculum.findAndCountAll({
      where: {
        [Op.or]: [{ title: { [Op.like]: `%${search.toLowerCase()}%` } }],
      },
      include: [
        {
          model: Section,
          as: "section",
          attributes: ["title"],
        },
      ],
      orderBy: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset: Number(offset),
    });
    res.status(200).json({
      status: "success",
      count: curriculums.count,
      limit,
      offset,
      data: curriculums.rows,
      message: "Curriculums retrieved successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const getCurriculumById = async (req, res) => {
  const { id } = req.params;
  try {
    const curriculum = await Curriculum.findOne({
      where: { id },
      include: [
        {
          model: Section,
          as: "section",
          attributes: ["title"],
        },
      ],
    });
    res.status(200).json({
      status: "success",
      data: curriculum,
      message: "Curriculum retrieved successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const createCurriculum = async (req, res) => {
  try {
    const curriculum = await Curriculum.create({
      id: uuidv4(),
      ...req.body,
    });
    res.status(201).json({
      status: "success",
      data: curriculum,
      message: "Create curriculum successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const updateCurriculumById = async (req, res) => {
  const { id } = req.params;
  try {
    const curriculum = await Curriculum.findOne({
      where: { id },
    });
    if (!curriculum) {
      return res.status(400).json({
        status: "error",
        message: "Curriculum not found",
      });
    }
    await curriculum.update(req.body);
    res.status(200).json({
      status: "success",
      data: curriculum,
      message: "Curriculum updated successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const deleteCurriculumById = async (req, res) => {
  const { id } = req.params;
  try {
    const curriculum = await Curriculum.findOne({
      where: { id },
    });
    if (!curriculum) {
      return res.status(400).json({
        status: "error",
        message: "Curriculum not found",
      });
    }
    await curriculum.destroy();
    res.status(200).json({
      status: "success",
      message: "Curriculum deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
