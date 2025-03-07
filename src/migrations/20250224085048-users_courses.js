"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users_courses", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      courseId: {
        allowNull: false,
        type: Sequelize.UUID,
        references: {
          model: "courses",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      data: {
        allowNull: false,
        type: Sequelize.JSON,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: new Date(),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("users_courses");
  },
};
