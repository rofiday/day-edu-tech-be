import dotenv from "dotenv";

dotenv.config();
export default {
  development: {
    username: process.env.DB_USERNAME_DEVELOPMENT ?? "root",
    password: process.env.DB_PASSWORD_DEVELOPMENT ?? "",
    database: process.env.DB_DATABASE_DEVELOPMENT ?? "day_lms",
    host: process.env.DB_HOST_DEVELOPMENT ?? "localhost",
    dialect: process.env.DB_DIALECT_DEVELOPMENT ?? "mysql",
  },
};
