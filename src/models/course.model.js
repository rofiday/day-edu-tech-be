import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {
      // define association here
      Course.hasMany(models.Section, {
        foreignKey: "courseId",
        as: "sections",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Course.belongsToMany(models.User, {
        through: "users_courses",
        foreignKey: "courseId",
        as: "users",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Course.belongsToMany(models.User, {
        through: "carts",
        foreignKey: "courseId",
        as: "users_carts",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Course.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      name: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      code: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      type: {
        allowNull: false,
        type: DataTypes.ENUM(
          "bootcamp",
          "content course",
          "mini bootcamp",
          "1on1 mentoring"
        ),
      },
      description: {
        allowNull: false,
        type: DataTypes.TEXT,
      },
      price: {
        allowNull: false,
        type: DataTypes.NUMBER,
      },
      urlImage: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      data: {
        allowNull: false,
        type: DataTypes.JSON({}),
      },
      isActive: {
        allowNull: false,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Course",
      tableName: "courses",
      timestamps: true,
    }
  );

  return Course;
};
