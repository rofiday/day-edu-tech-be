import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Role extends Model {
    static associate(models) {
      // define association here
      Role.belongsToMany(models.User, {
        through: "users_roles",
        foreignKey: "roleId",
        as: "users",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Role.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      roleName: {
        allowNull: false,
        type: DataTypes.STRING,
      },
    },
    {
      sequelize,
      modelName: "Role",
      tableName: "roles",
      timestamps: true,
    }
  );

  return Role;
};
