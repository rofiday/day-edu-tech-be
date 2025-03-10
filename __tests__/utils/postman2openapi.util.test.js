import { describe, jest, beforeEach, afterEach, test } from "@jest/globals";

jest.unstable_mockModule("axios", () => ({
  default: {
    get: jest.fn(),
  },
}));

jest.unstable_mockModule("dotenv", () => ({
  default: {
    config: jest.fn(),
  },
}));

jest.unstable_mockModule("fs/promises", () => ({
  writeFile: jest.fn(),
}));

jest.unstable_mockModule("postman2openapi", () => ({
  transpile: jest.fn(),
}));

describe("postman2openapi.util", () => {
  let axios, fs, generateOpenAPI, transpile;

  beforeEach(async () => {
    axios = (await import("axios")).default;
    fs = await import("fs/promises");
    transpile = (await import("postman2openapi")).transpile;
    generateOpenAPI = (await import("../../src/utils/postman2openapi.util.js"))
      .default; // 🛠️ Hapus .default
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("should log an error and return if environment variables are missing", async () => {
    delete process.env.POSTMAN_API_URL;
    const consoleSpy = jest.spyOn(console, "log");
    await generateOpenAPI();
    expect(consoleSpy).toHaveBeenCalledWith(
      "Please set POSTMAN_API_URL and POSTMAN_ACCESS_KEY environment variables."
    );
  });

  test("should fetch data from Postman API, transpile, and write to a file", async () => {
    process.env.POSTMAN_API_URL = "https://api.postman.com/mock";
    process.env.POSTMAN_ACCESS_KEY = "test-access-key";
    process.env.API_URL = "https://api.example.com";
    process.env.SWAGGER_OUTPUT_PATH = "./swagger.json";

    const mockData = { collection: { info: {}, item: [] } };
    const transpiledData = { openapi: "3.0.0", servers: [] };

    axios.get.mockResolvedValue({ data: mockData });
    fs.writeFile.mockResolvedValue();
    transpile.mockReturnValue(transpiledData);
    const consoleSpy = jest.spyOn(console, "log");

    await generateOpenAPI();

    expect(axios.get).toHaveBeenCalledWith(
      `${process.env.POSTMAN_API_URL}?access_key=${process.env.POSTMAN_ACCESS_KEY}`
    );
    expect(transpile).toHaveBeenCalledWith(mockData.collection);
    expect(fs.writeFile).toHaveBeenCalledWith(
      process.env.SWAGGER_OUTPUT_PATH,
      JSON.stringify(
        { ...transpiledData, servers: [{ url: process.env.API_URL }] },
        null,
        2
      )
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "OpenAPI JSON file has been updated successfully."
    );
  });

  test("should log an error and throw if an error occurs", async () => {
    axios.get.mockRejectedValue(new Error("API Error"));
    const consoleSpy = jest.spyOn(console, "log");

    await expect(generateOpenAPI()).rejects.toThrow("API Error");
    expect(consoleSpy).toHaveBeenCalledWith("API Error");
  });
});
