import fs from "fs";
import path from "path";
import { Sequelize } from "sequelize";
import process from "process";
import configJson from "../config/database.js";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = configJson[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

const loadModels = async () => {
  const files = fs.readdirSync(__dirname).filter((file) => {
    return (
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  });

  const modelImports = files.map((file) =>
    import(pathToFileURL(path.join(__dirname, file)).href)
  );

  const models = await Promise.all(modelImports);

  models.forEach((modelModule) => {
    const model = modelModule.default(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

  Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
};

await loadModels();

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export default db;
