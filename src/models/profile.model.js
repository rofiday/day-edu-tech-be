import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Profile extends Model {
    static associate(models) {
      // define association here
      Profile.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      });
    }
  }

  Profile.init(
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
      bio: {
        allowNull: true,
        type: DataTypes.TEXT,
      },
      profileImage: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      address: {
        allowNull: true,
        type: DataTypes.STRING,
      },
      gender: {
        allowNull: false,
        type: DataTypes.ENUM("male", "female"),
      },
      birthDate: {
        allowNull: true,
        type: DataTypes.DATE,
      },
      socialLinks: {
        allowNull: true,
        type: DataTypes.JSON,
      },
    },
    {
      sequelize,
      modelName: "Profile",
      tableName: "profiles",
      timestamps: true,
    }
  );

  return Profile;
};
