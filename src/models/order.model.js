import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      // define association here
      Order.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Order.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      totalPrice: {
        allowNull: false,
        type: DataTypes.FLOAT,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      status: {
        allowNull: false,
        type: DataTypes.STRING,
        defaultValue: "pending",
      },
      paymentStatus: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      orderId: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      token: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      data: {
        allowNull: false,
        type: DataTypes.JSON,
      },
      isActive: {
        allowNull: true,
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "orders",
      timestamps: true,
    }
  );

  return Order;
};
