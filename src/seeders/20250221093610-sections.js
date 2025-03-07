"use strict";
import { v4 as uuidv4 } from "uuid";
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const { default: db } = await import("../models/index.js");

    const courseFSJSBC = await db.Course.findOne({
      where: { code: "FULL_STACK_JAVASCRIPT_BC" },
      attributes: ["id"],
    });

    const courseFSJSCC = await db.Course.findOne({
      where: { code: "FULL_STACK_JAVASCRIPT_CC" },
      attributes: ["id"],
    });
    const courseFSJS1on1Mentoring = await db.Course.findOne({
      where: { code: "FULL_STACK_JAVASCRIPT_1on1" },
      attributes: ["id"],
    });
    const courseFSJSMB = await db.Course.findOne({
      where: { code: "FULL_STACK_JAVASCRIPT_Mb" },
      attributes: ["id"],
    });

    const sections = [];
    sections.push({
      id: uuidv4(),
      title: "Introduction Web Development",
      courseId: courseFSJSBC.id,
      data: "{}",
      isActive: false,
    });
    sections.push({
      id: uuidv4(),
      title: "Introduction Web Development",
      courseId: courseFSJSCC.id,
      data: "{}",
      isActive: false,
    });
    sections.push({
      id: uuidv4(),
      title: "Introduction Web Development",
      courseId: courseFSJS1on1Mentoring.id,
      data: "{}",
      isActive: false,
    });
    sections.push({
      id: uuidv4(),
      title: "Introdcution Web Development",
      courseId: courseFSJSMB.id,
      data: "{}",
      isActive: false,
    });

    await queryInterface.bulkInsert("sections", sections, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("sections", null, {});
  },
};
