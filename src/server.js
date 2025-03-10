import express from "express";
import fs from "fs";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import router from "./routes/index.js";
import rateLimit from "express-rate-limit";
const app = express();
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import swaggerUi from "swagger-ui-express";
const swaggerFilePath = path.join(__dirname, "./config/swagger-output.json");
const swaggerSpec = JSON.parse(fs.readFileSync(swaggerFilePath, "utf8"));

// Gunakan Swagger UI Express dengan file JSON
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
dotenv.config();

const PORT = process.env.PORT || 3000;
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: "Too many request from this  IP, please try again later",
});
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(cookieParser());
app.use(
  cors({
    origin: process.env.APP_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use(
  "/assets/images/courses",
  express.static(path.join(__dirname, "/assets/images/courses"))
);
app.use(
  "/assets/images/profiles",
  express.static(path.join(__dirname, "/assets/images/profiles"))
);
app.use("/", limiter);
app.use("/", router);
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
