"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("profiles", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      bio: {
        allowNull: true,
        type: Sequelize.TEXT,
      },
      profileImage: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      address: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      gender: {
        allowNull: false,
        type: Sequelize.ENUM("male", "female"),
        defaultValue: "male",
      },
      birthDate: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      socialLinks: {
        allowNull: true,
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
    await queryInterface.dropTable("profiles");
  },
};
