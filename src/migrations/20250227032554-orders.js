"use strict";
/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("orders", {
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
      totalPrice: {
        allowNull: false,
        type: Sequelize.FLOAT,
      },
      email: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      status: {
        allowNull: false,
        type: Sequelize.STRING,
        defaultValue: "init",
      },
      paymentStatus: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      orderId: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      token: {
        allowNull: false,
        type: Sequelize.STRING,
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
    await queryInterface.dropTable("orders");
  },
};
