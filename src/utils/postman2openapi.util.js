import * as fs from "fs/promises";
import { transpile } from "postman2openapi";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const generateOpenAPI = async () => {
  try {
    if (!process.env.POSTMAN_API_URL || !process.env.POSTMAN_ACCESS_KEY) {
      console.log(
        "Please set POSTMAN_API_URL and POSTMAN_ACCESS_KEY environment variables."
      );
      return;
    }
    const response = await axios.get(
      `${process.env.POSTMAN_API_URL}?access_key=${process.env.POSTMAN_ACCESS_KEY}`
    );
    const openapi = transpile(response.data.collection);
    openapi.servers = [{ url: process.env.API_URL }];
    await fs.writeFile(
      process.env.SWAGGER_OUTPUT_PATH,
      JSON.stringify(openapi, null, 2)
    );
    console.log("OpenAPI JSON file has been updated successfully.");
  } catch (error) {
    console.log(error.message);
    throw error;
  }
};

const run = async () => {
  try {
    await generateOpenAPI();
  } catch (error) {
    console.log(error.message);
  }
};

run();

export default generateOpenAPI;
