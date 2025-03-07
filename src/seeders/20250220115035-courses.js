"use strict";
import { v4 as uuidv4 } from "uuid";
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const courses = [];
    courses.push({
      id: uuidv4(),
      name: "Full-Stack JavaScript - BC",
      code: "FULL_STACK_JAVASCRIPT_BC",
      type: "bootcamp",
      description:
        "Belajar membuat aplikasi web yang interaktif dan dinamis dengan teknologi JavaScript, HTML, CSS, dan Node.js. Anda akan mempelajari bagaimana membuat frontend dan backend yang scalable dan efisien. ",
      price: 25000000,
      urlImage: "/assets/images/courses/1740652579657.jpg",
      data: JSON.stringify({}),
      isActive: true,
    });
    courses.push({
      id: uuidv4(),
      name: "Full-Stack JavaScript - CC",
      code: "FULL_STACK_JAVASCRIPT_CC",
      type: "content course",
      description:
        "Belajar membuat aplikasi web yang interaktif dan dinamis dengan teknologi JavaScript, HTML, CSS, dan Node.js. Anda akan mempelajari bagaimana membuat frontend dan backend yang scalable dan efisien. ",
      price: 250000,
      urlImage: "/assets/images/courses/1741066095819.png",
      data: JSON.stringify({}),
      isActive: true,
    });
    courses.push({
      id: uuidv4(),
      name: "Full-Stack JavaScript - MB",
      code: "FULL_STACK_JAVASCRIPT_MB",
      type: "mini bootcamp",
      description:
        "Belajar membuat aplikasi web yang interaktif dan dinamis dengan teknologi JavaScript, HTML, CSS, dan Node.js. Anda akan mempelajari bagaimana membuat frontend dan backend yang scalable dan efisien. ",
      price: 2500000,
      urlImage: "/assets/images/courses/1741066046846.png",
      data: JSON.stringify({}),
      isActive: true,
    });
    courses.push({
      id: uuidv4(),
      name: "Full-Stack JavaScript - 1on1 Mentoring",
      code: "FULL_STACK_JAVASCRIPT_1on1",
      type: "1on1 mentoring",
      description:
        "Belajar membuat aplikasi web yang interaktif dan dinamis dengan teknologi JavaScript, HTML, CSS, dan Node.js. Anda akan mempelajari bagaimana membuat frontend dan backend yang scalable dan efisien. ",
      price: 25000,
      urlImage: "/assets/images/courses/1741066083261.svg",
      data: JSON.stringify({}),
      isActive: true,
    });
    await queryInterface.bulkInsert("courses", courses, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("courses", null, {});
  },
};
