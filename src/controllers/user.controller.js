import db from "../models/index.js";
const { User, Profile, Role, UserRole, UserCourse, Course, sequelize } = db;
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import { generateRandomCharacters } from "../utils/character.util.js";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import handlebars from "handlebars";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getAllUser = async (req, res) => {
  const { limit = 10, offset = 0, search = "" } = req.query;
  try {
    const users = await User.findAndCountAll({
      where: {
        [Op.or]: [
          { fullname: { [Op.like]: `%${search?.toLowerCase()}%` } },
          { username: { [Op.like]: `%${search?.toLowerCase()}%` } },
          { email: { [Op.like]: `%${search?.toLowerCase()}%` } },
          { phoneNumber: { [Op.like]: `%${search?.toLowerCase()}%` } },
        ],
      },
      orderBy: [["createdAt", "DESC"]],
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["roleName"],
          through: { attributes: [] },
        },
        {
          model: Course,
          as: "courses",
          attributes: ["id", "name"],
          through: { attributes: [] },
        },
      ],
      limit: Number(limit),
      offset: Number(offset),
    });
    res.status(200).json({
      status: "success",
      count: users.count,
      limit,
      offset,
      data: users.rows,
      message: "Users retrieved successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      where: { id },
    });
    res.status(200).json({
      status: "success",
      data: user,
      message: "User retrieved successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
export const createUser = async (req, res) => {
  const { fullname, username, phoneNumber, email } = req.body;
  let transaction = await sequelize.transaction();
  try {
    const password = generateRandomCharacters(20);
    //create user with bcrypt
    let hashPassword = await bcrypt.hash(password, 10);

    const user = await User.create(
      {
        id: uuidv4(),
        fullname: fullname,
        username: username,
        phoneNumber: phoneNumber,
        password: hashPassword,
        email: email,
        isActive: true,
      },
      { transaction }
    );
    //promisesALl menungggu semua proses selesai baru lanjut
    await Promise.all(
      req.body.courses.map(async (course) => {
        await UserCourse.create(
          {
            userId: user.id,
            courseId: course.value,
            data: {},
          },
          { transaction }
        );
      })
    );
    const role = await Role.findOne({
      where: { roleName: "Student" },
      attributes: ["id"],
    });
    if (!role) {
      return res.status(404).json({
        status: "error",
        message: "Role not found",
      });
    }
    await UserRole.create(
      {
        userId: user.id,
        roleId: role.id,
      },
      { transaction }
    );
    await Profile.create(
      {
        userId: user.id,
        bio: null,
        profileImage: null,
        address: null,
        gender: "male",
        birthDate: null,
        socialLinks: null,
      },
      { transaction }
    );
    const token = jwt.sign(
      {
        id: user.id,
        email: email,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    const transporter = nodemailer.createTransport({
      service: process.env.MAIL_SERVICE,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_APP_PASSWORD,
      },
    });
    const emailTemplateSource = fs.readFileSync(
      path.join(__dirname, "../templates/resetPassword.hbs"),
      "utf-8"
    );
    const template = handlebars.compile(emailTemplateSource);
    const htmlToSend = template({
      logoUrl:
        "https://res.cloudinary.com/dyf0cut7i/image/upload/fl_preserve_transparency/v1740042252/dayedutech-high-resolution-logo_1_bfwjkm.jpg",
      fullname: user.fullname,
      verificationLink: `${process.env.APP_URL}/reset-password?token=${token}`,
    });
    const mailOptions = {
      from: "dayedutech@gmail.com",
      to: email,
      subject: "please reset your password!!",
      html: htmlToSend,
    };
    await transporter.sendMail(mailOptions);
    await transaction.commit();
    res.status(201).json({
      status: "success",
      data: user,
      message: "User created successfully, waiting user to verify",
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const updateUserById = async (req, res) => {
  const { id } = req.params;
  const { fullname, username, phoneNumber, email, password } = req.body;
  try {
    const user = await User.findOne({
      where: { id },
    });
    const userCourses = await UserCourse.findAll({
      where: { userId: user.id },
    });
    await Promise.all(
      userCourses.map(async (course) => {
        await course.destroy();
      })
    );
    await Promise.all(
      req.body.courses?.map(async (course) => {
        await UserCourse.create({
          id: uuidv4(),
          userId: user.id,
          courseId: course.value,
          data: {},
        });
      })
    );
    let hashPassword = user.password;
    if (password) {
      hashPassword = await bcrypt.hash(password, 10);
    }
    await user.update({
      username: username || user.username,
      fullname: fullname || user.fullname,
      phoneNumber: phoneNumber || user.phoneNumber,
      email: email || user.email,
      courses: user.courses,
    });
    res.status(200).json({
      status: "success",
      data: user,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const deleteUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findOne({
      where: { id },
    });
    await user.destroy();
    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
