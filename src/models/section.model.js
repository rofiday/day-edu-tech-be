import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Section extends Model {
    static associate(models) {
      // define association here
      Section.belongsTo(models.Course, {
        foreignKey: "courseId",
        as: "course",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
      Section.hasMany(models.Curriculum, {
        foreignKey: "sectionId",
        as: "curriculums",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Section.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
      },
      title: {
        allowNull: false,
        type: DataTypes.STRING,
      },
      courseId: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      data: {
        allowNull: false,
        type: DataTypes.JSON({}),
      },
      isActive: {
        allowNull: true,
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "Section",
      tableName: "sections",
      timestamps: true,
    }
  );

  return Section;
};
