"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("sections", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      title: {
        allowNull: false,
        type: Sequelize.STRING,
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
      isActive: {
        allowNull: true,
        type: Sequelize.BOOLEAN,
        defaultValue: true,
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
    await queryInterface.dropTable("sections");
  },
};
