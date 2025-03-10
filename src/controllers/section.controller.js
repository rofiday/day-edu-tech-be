import db from "../models/index.js";
const { Section, Course } = db;
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";

export const getAllAvailableSections = async (req, res) => {
  const { q } = req.query;
  try {
    const sections = await Section.findAndCountAll({
      where: {
        [Op.or]: [{ title: { [Op.like]: `%${q.toLowerCase()}%` } }],
      },
      limit: 5,
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["name"],
        },
      ],
      orderBy: [["createdAt", "DESC"]],
    });
    res.status(200).json({
      status: "success",
      count: sections.count,
      data: sections.rows,
      message: "Sections retrieved successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
export const getAllSection = async (req, res) => {
  const { limit = 10, offset = 0, search = "" } = req.query;
  try {
    const sections = await Section.findAndCountAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${search.toLowerCase()}%` } },
          { courseId: { [Op.like]: `%${search.toLowerCase()}%` } },
        ],
      },
      include: [
        {
          model: Course,
          as: "course",
          attributes: ["name"],
        },
      ],
      orderBy: [["createdAt", "DESC"]],
      limit: Number(limit),
      offset: Number(offset),
    });
    res.status(200).json({
      status: "success",
      count: sections.count,
      limit,
      offset,
      data: sections.rows,
      message: "Sections retrieved successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const getSectionById = async (req, res) => {
  const { id } = req.params;
  try {
    const section = await Section.findOne({ where: { id } });
    if (!section) {
      return res.status(404).json({
        status: "error",
        message: "Section not found",
      });
    }
    res.status(200).json({
      status: "success",
      data: section,
      message: "Section retrieved successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const createSection = async (req, res) => {
  try {
    const section = await Section.create({
      id: uuidv4(),
      ...req.body,
      data: "{}",
    });
    res.status(201).json({
      status: "success",
      data: section,
      message: "Create section successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const updateSectionById = async (req, res) => {
  const { id } = req.params;
  try {
    const section = await Section.findOne({ where: { id } });
    if (!section) {
      return res.status(404).json({
        status: "error",
        message: "Section not found",
      });
    }
    await section.update(req.body);
    res.status(200).json({
      status: "success",
      data: section,
      message: "Section updated successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const deleteSectionById = async (req, res) => {
  const { id } = req.params;
  try {
    const section = await Section.findOne({ where: { id } });
    if (!section) {
      return res.status(404).json({
        status: "error",
        message: "Section not found",
      });
    }
    await section.destroy();
    res.status(200).json({
      status: "success",
      message: "Section deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
