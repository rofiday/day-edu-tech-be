import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Curriculum extends Model {
    static associate(models) {
      // define association here
      Curriculum.belongsTo(models.Section, {
        foreignKey: "sectionId",
        as: "section",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Curriculum.init(
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
      sectionId: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      contents: {
        allowNull: false,
        type: DataTypes.TEXT,
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
      modelName: "Curriculum",
      tableName: "curriculums",
      timestamps: true,
    }
  );

  return Curriculum;
};
