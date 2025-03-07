"use strict";
import { v4 as uuidv4 } from "uuid";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const { default: db } = await import("../models/index.js");

    const student = await db.User.findOne({
      where: { email: "student@dayedutech.com" },
      attributes: ["id"],
    });
    const courses = await db.Course.findAll({
      where: {
        code: {
          [Sequelize.Op.in]: [
            "FULL_STACK_JAVASCRIPT_BC",
            "FULL_STACK_JAVASCRIPT_CC",
          ],
        },
      },
      attributes: ["id"],
    });

    const userCourses = [];

    userCourses.push({
      id: uuidv4(),
      userId: student.id,
      courseId: courses[0].id,
      data: "{}",
    });

    userCourses.push({
      id: uuidv4(),
      userId: student.id,
      courseId: courses[1].id,
      data: "{}",
    });
    await queryInterface.bulkInsert("users_courses", userCourses, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users_courses", null, {});
  },
};
