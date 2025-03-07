import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Cart extends Model {
    static associate(models) {
      // define association here
    }
  }

  Cart.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      userId: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      courseId: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Cart",
      tableName: "carts",
      timestamps: true,
    }
  );

  return Cart;
};
