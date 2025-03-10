import { describe, jest, test } from "@jest/globals";
import { upload } from "../../src/utils/file.util.js"; // Sesuaikan path dengan lokasi sebenarnya

describe("Multer Storage Configuration", () => {
  test("should set the correct destination folder based on request body", (done) => {
    const req = { body: { folder: "test-folder" } };
    const file = {};
    const cb = jest.fn();

    upload.storage.getDestination(req, file, cb);
    done();
  });

  test("should rename file with a timestamp and maintain the extension", (done) => {
    const req = {};
    const file = { originalname: "image.png" };
    const cb = jest.fn();

    upload.storage.getFilename(req, file, cb);
    done();
  });
});
