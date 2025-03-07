import db from "../models/index.js";
const { Curriculum } = db;
import Joi from "joi";
import { Op } from "sequelize";

export const middlewareGetCurriculumById = async (req, res, next) => {
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
    // ini digunakan untuk mengambil data curriculum berdasarkan id yang dikirimkan lewat parameter
    // setelah data di dapatkan, maka data tersebut akan di simpan ke req.curriculum
    // req.curriculum akan digunakan di controller untuk mengambil data yang dibutuhkan
    // misalnya untuk mengupdate data atau menghapus data
    req.curriculum = curriculum;
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const middlewareCreateCurriculum = async (req, res, next) => {
  try {
    const curriculum = await Curriculum.findOne({
      where: {
        [Op.or]: {
          title: req.body.title,
        },
      },
    });
    if (curriculum) {
      return res.status(400).json({
        status: "error",
        message: "Curriculum with the same title already exists",
      });
    }
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const middlewareUpdateCurriculumById = async (req, res, next) => {
  try {
    const schema = Joi.object({
      title: Joi.string().required(),
      sectionId: Joi.string().required(),
      sectionTitle: Joi.string().required(),
      contents: Joi.string().required(),
    });
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }
    const { id } = req.params;
    const curriculum = await Curriculum.findOne({
      where: { id },
    });
    if (!curriculum) {
      return res.status(400).json({
        status: "error",
        message: "Curriculum not found",
      });
    }
    req.curriculum = curriculum;
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
export const middlewareDeleteCurriculumById = async (req, res, next) => {
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
    req.curriculum = curriculum;
    next();
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
