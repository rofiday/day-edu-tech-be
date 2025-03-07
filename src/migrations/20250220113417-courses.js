"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("courses", {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
      },
      name: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      code: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      type: {
        allowNull: false,
        type: Sequelize.ENUM(
          "bootcamp",
          "content course",
          "mini bootcamp",
          "1on1 mentoring"
        ),
      },
      description: {
        allowNull: false,
        type: Sequelize.TEXT,
      },
      price: {
        allowNull: false,
        type: Sequelize.FLOAT,
      },
      urlImage: {
        allowNull: true,
        type: Sequelize.STRING,
      },
      //ada data tambahan yang dibutuhkan tidak perlu membuat column baru cukup masukan data
      //baru tersebut dalam column data
      data: {
        allowNull: false,
        type: Sequelize.JSON({}),
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
    await queryInterface.dropTable("courses");
  },
};
