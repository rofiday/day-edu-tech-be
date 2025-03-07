"use strict";
import { v4 as uuidv4 } from "uuid";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const { default: db } = await import("../models/index.js");

    const sectionsOne = await db.Section.findOne({
      where: { title: "Introduction Web Development" },
      attributes: ["id"],
    });
    const sectionsTwo = await db.Section.findOne({
      where: { title: "Introduction Web Development" },
      attributes: ["id"],
    });
    const sectionThree = await db.Section.findOne({
      where: { title: "Introduction Web Development" },
      attributes: ["id"],
    });
    const sectionFour = await db.Section.findOne({
      where: { title: "Introduction Web Development" },
      attributes: ["id"],
    });

    const curriculums = [];
    curriculums.push({
      id: uuidv4(),
      title: "Fundamental html dan css",
      sectionId: sectionsOne.id,
      contents:
        '<p>\t\t<span style="background-color: rgb(250, 250, 250); color: rgba(0, 0, 0, 0.87);">Dalam modul ini, kamu akan fokus mempelajari front-end development khususnya dalam membuat UI untuk web aplikasi menggunakan HTML, CSS, dan React JS. Materi yang akan dipelajari di modul ini mencakup:</span></p><p><br></p><ul><li>Intro to front-end development, HTML &amp; CSS fundamental</li></ul><iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/3U1AhjEf7DM?showinfo=0" style="width: 100%; height: 500px;"></iframe><p><br></p>',
      data: "{}",
      isActive: false,
    });
    curriculums.push({
      id: uuidv4(),
      title: "Advance CSS",
      sectionId: sectionsOne.id,
      contents:
        '<p>Mempelajari materi lanjutan pada CSS, belajar dalam membuat tampilan pada sebuah website</p><iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/MCVkMmYL-aY?showinfo=0" style="width: 100%; height: 500px;"></iframe><p><br></p>',
      data: "{}",
      isActive: false,
    });
    curriculums.push({
      id: uuidv4(),
      title: "Framework CSS",
      sectionId: sectionsTwo.id,
      contents:
        '<p>mempelajari framework css untuk membuat tampilan website yang lebih powerfull</p><iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/z3slaXqmkT0?showinfo=0" style="width: 100%; height: 500px;"></iframe><iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/ELCr9MyRTH8?showinfo=0" style="width: 100%; height: 500px;"></iframe><iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/_lgltVQ3Lvo?showinfo=0" style="width: 100%; height: 500px;"></iframe><p><br></p>',
      data: "{}",
      isActive: false,
    });
    curriculums.push({
      id: uuidv4(),
      title: "Intro React & Next Js",
      sectionId: sectionsTwo.id,
      contents:
        '<p>pada sesi ini mulai mempelajari cara setup project menggunakan framework front end developer, dan mempelajari lifecyle secara detail</p><iframe class="ql-video" frameborder="0" allowfullscreen="true" src="https://www.youtube.com/embed/rNSfMxMPWqc?showinfo=0" style="width: 100%; height: 500px;"></iframe><p><br></p>',
      data: "{}",
      isActive: false,
    });
    await queryInterface.bulkInsert("curriculums", curriculums, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("curriculums", null, {});
  },
};
