import dotenv from "dotenv";
dotenv.config();
import db from "../models/index.js";
const { User, Profile, UserRole, Role, sequelize } = db;
import admin from "../services/firebase.service.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { generatePassword } from "../services/generateCharacter.js";
import { v4 as uuidv4 } from "uuid";
import handlebars from "handlebars";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const register = async (req, res) => {
  let transaction = await sequelize.transaction();
  try {
    req.body.password = await bcrypt.hash(req.body.password, 10);
    const user = await User.create(
      {
        ...req.body,
        id: uuidv4(),
        isActive: false,
      },
      { transaction }
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
        email: req.body.email,
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
      path.join(__dirname, "../templates/emailVerification.hbs"),
      "utf-8"
    );
    const template = handlebars.compile(emailTemplateSource);
    const htmlToSend = template({
      logoUrl:
        "https://res.cloudinary.com/dyf0cut7i/image/upload/fl_preserve_transparency/v1740042252/dayedutech-high-resolution-logo_1_bfwjkm.jpg",
      fullname: user.fullname,
      verificationLink: `${process.env.API_URL}/auth/verify-email?token=${token}`,
    });
    const mailOptions = {
      from: "dayedutech@gmail.com",
      to: req.body.email,
      subject: "please verification your email!!",
      html: htmlToSend,
    };
    await transporter.sendMail(mailOptions);
    await transaction.commit();
    res.status(201).json({
      status: "success",
      data: user,
      message: "User registered successfully, please check your email",
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({
      where: { email: email },
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["roleName"],
          through: { attributes: [] },
        },
      ],
    });
    if (!user || !user.isActive) {
      return res.status(404).json({
        status: "error",
        message: "invalid email or password or user activation",
      });
    }
    req.body.password = await bcrypt.compare(password, user.password);
    if (!req.body.password) {
      return res.status(404).json({
        status: "error",
        message: "invalid email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        roleName: user.roles[0].roleName,
      },
      process.env.JWT_SECRET
    );
    res.cookie(process.env.COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: "success",
      data: token,
      message: "Login successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
export const continueWithGoogle = async (req, res) => {
  const { idToken } = req.body;
  let transaction = await sequelize.transaction();
  try {
    /**membuat verifikasi token yang di set di fe */
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    let user = await User.findOne({
      where: { email: decodedToken.email },
      attributes: [
        "id",
        "fullname",
        "username",
        "phoneNumber",
        "email",
        "password",
      ],
      include: [
        {
          model: Role,
          as: "roles",
          attributes: ["roleName"],
          through: { attributes: [] },
        },
      ],
    });
    /** jika user tidak ditemukan */
    if (!user) {
      user = await User.create(
        {
          fullname: decodedToken.name,
          username: decodedToken.email.split("@")[0],
          phoneNumber: "08XXXXXXXXXX",
          email: decodedToken.email,
          password: await bcrypt.hash(generatePassword(), 10),
          isActive: true,
        },
        { transaction }
      );
      await UserRole.create(
        {
          userId: user.id,
          roleId: (
            await Role.findOne({
              attributes: ["id"],
              where: { roleName: "Student" },
            })
          ).id,
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
      user.dataValues.roles = [{ roleName: "Student" }];
    }
    await transaction.commit();
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        email: user.email,
        roleName: user.dataValues.roles[0].roleName,
      },
      process.env.JWT_SECRET
    );
    console.log("token", token);
    console.log(res.cookie);
    res.cookie(process.env.COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: "success",
      data: token,
      message: "Login successfully",
    });
  } catch (error) {
    await transaction.rollback();
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("day-edutech");
    res.status(200).json({
      status: "success",
      message: "Logout successfully",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({
      where: { email },
    });
    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "can't reset your password",
      });
    }
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
    res.status(200).json({
      status: "success",
      message:
        "Forgot password successfully sent to email, please check your inbox!",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Invalid to verify",
      });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(400).json({
        status: "error",
        message: "Invalid to verify",
      });
    }
    const user = await User.findOne({
      where: { id: decodedToken.id },
    });
    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Invalid to verify",
      });
    }
    user.isActive = true;
    await user.save();
    res.redirect(process.env.APP_URL + "/login");
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({
        status: "error",
        message: "Invalid to reset password",
      });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(400).json({
        status: "error",
        message: "Invalid to reset password",
      });
    }
    const user = await User.findOne({
      where: { id: decodedToken.id },
    });
    if (!user) {
      return res.status(400).json({
        status: "error",
        message: "Invalid to reset password",
      });
    }
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.status(200).json({
      status: "success",
      message: "Reset password successfully!",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).send(error.message);
  }
};
