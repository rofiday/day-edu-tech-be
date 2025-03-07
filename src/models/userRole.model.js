import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class UserRole extends Model {
    static associate(models) {
      // define association here
    }
  }

  UserRole.init(
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
      roleId: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "UserRole",
      tableName: "users_roles",
      timestamps: true,
    }
  );

  return UserRole;
};
