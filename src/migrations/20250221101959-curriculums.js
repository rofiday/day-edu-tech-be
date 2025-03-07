"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.createTable("curriculums", {
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
        sectionId: {
          allowNull: false,
          type: Sequelize.UUID,
          references: {
            model: "sections",
            key: "id",
          },
          onDelete: "CASCADE",
          onUpdate: "CASCADE",
        },
        contents: {
          allowNull: true,
          type: Sequelize.TEXT,
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
    } catch (error) {
      console.log(error);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("curriculums");
  },
};
