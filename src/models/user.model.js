import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // define association here
      User.hasOne(models.Profile, {
        foreignKey: "userId",
        as: "profile",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      User.belongsToMany(models.Role, {
        through: "users_roles",
        foreignKey: "userId",
        as: "roles",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      User.belongsToMany(models.Course, {
        through: "users_courses",
        foreignKey: "userId",
        as: "courses",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      User.belongsToMany(models.Course, {
        through: "carts",
        foreignKey: "userId",
        as: "courses_carts",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      User.hasMany(models.Order, {
        foreignKey: "userId",
        as: "orders",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  User.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      fullname: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      username: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
      },
      phoneNumber: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      email: {
        allowNull: false,
        type: DataTypes.STRING,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      password: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      isActive: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
    }
  );

  return User;
};
