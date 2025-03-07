import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class UserCourse extends Model {
    static associate(models) {
      // define association here
    }
  }

  UserCourse.init(
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
      courseId: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      data: {
        allowNull: false,
        type: DataTypes.JSON,
      },
    },
    {
      sequelize,
      modelName: "UserCourse",
      tableName: "users_courses",
      timestamps: true,
    }
  );

  return UserCourse;
};
