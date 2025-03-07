import { v4 as uuidv4 } from "uuid";
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const roles = [
      {
        id: uuidv4(),
        roleName: "Admin",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        roleName: "Student",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: uuidv4(),
        roleName: "Mentor",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    await queryInterface.bulkInsert("roles", roles, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("roles", null, {});
  },
};
