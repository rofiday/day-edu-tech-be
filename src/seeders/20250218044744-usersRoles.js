"use strict";

import { v4 as uuidv4 } from "uuid";
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const { default: db } = await import("../models/index.js");
    const users = await db.User.findAll({
      attributes: ["id", "username"],
    });
    const roles = await db.Role.findAll({
      attributes: ["id", "roleName"],
    });
    const usersRoles = users.map((user) => {
      const usernameRoles = ["Mentor", "Student", "Admin"];
      if (!usernameRoles.includes(user.username)) {
        return {
          id: uuidv4(),
          userId: user.id,
          roleId: roles[Math.floor(Math.random() * roles.length)].id,
        };
      } else {
        return {
          id: uuidv4(),
          userId: user.id,
          roleId: roles.find((role) => role.roleName === user.username).id,
        };
      }
    });

    await queryInterface.bulkInsert("users_roles", usersRoles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("users_roles", null, {});
  },
};
