import forge from "node-forge";
import { Buffer } from "buffer";
import jwt from "jsonwebtoken";
import { describe, jest, test } from "@jest/globals";
import {
  generateSessionKey,
  decryptPayload,
} from "../../src/utils/forge.util.js"; // Sesuaikan path dengan lokasi yang benar

describe("generateSessionKey", () => {
  test("should generate a session key and return a JWT", () => {
    const req = {};
    const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };

    process.env.JWT_SECRET = "test_secret";

    generateSessionKey(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ __unknown_session: expect.any(String) })
    );
  });
});

describe("decryptPayload", () => {
  test("should throw an error if decryption fails", () => {
    const fakeCompositeHash = { __unknown: "invalid_data" };
    console.error = jest.fn();
    expect(() => decryptPayload(fakeCompositeHash)).toThrow(
      "failed to process the request"
    );
  });

  test("should return decrypted payload if valid data is provided", () => {
    const mockSession = jwt.sign({}, "test_secret");
    const fakePrivateKeyPem = forge.pki.privateKeyToPem(
      forge.pki.rsa.generateKeyPair({ bits: 2048 }).privateKey
    );
    process.env.JWT_SECRET = "test_secret";
    process.env.APP_PRIVATE_KEY =
      Buffer.from(fakePrivateKeyPem).toString("base64");

    const encryptedData = {
      payload: forge.util.encode64('{"data":"test"}'),
      key: forge.util.encode64("fake_symmetric_key"),
      session: mockSession,
      iv: forge.util.encode64("fake_iv"),
      hmac: "fake_hmac",
    };
    const compositeHash = {
      __unknown: Buffer.from(JSON.stringify(encryptedData)).toString("base64"),
    };

    jest.spyOn(forge.pki, "privateKeyFromPem").mockReturnValue({
      decrypt: jest.fn().mockReturnValue("fake_symmetric_key"),
    });
    jest.spyOn(forge.hmac, "create").mockReturnValue({
      start: jest.fn(),
      update: jest.fn(),
      digest: jest
        .fn()
        .mockReturnValue({ toHex: jest.fn().mockReturnValue("fake_hmac") }),
    });
    jest.spyOn(forge.cipher, "createDecipher").mockReturnValue({
      start: jest.fn(),
      update: jest.fn(),
      finish: jest.fn().mockReturnValue(true),
      output: { toString: jest.fn().mockReturnValue('{"data":"test"}') },
    });
    console.error = jest.fn();
    const result = decryptPayload(compositeHash);
    expect(result).toEqual({ data: "test" });
  });
  test("should return an error if computed HMAC does not match received HMAC", () => {
    const mockSession = jwt.sign({}, "test_secret");
    process.env.JWT_SECRET = "test_secret";

    const encryptedData = {
      payload: forge.util.encode64('{"data":"test"}'),
      key: forge.util.encode64("fake_symmetric_key"),
      session: mockSession,
      iv: forge.util.encode64("fake_iv"),
      hmac: "wrong_hmac",
    };
    const compositeHash = {
      __unknown: Buffer.from(JSON.stringify(encryptedData)).toString("base64"),
    };

    jest.spyOn(forge.hmac, "create").mockReturnValue({
      start: jest.fn(),
      update: jest.fn(),
      digest: jest
        .fn()
        .mockReturnValue({ toHex: jest.fn().mockReturnValue("computed_hmac") }),
    });
    console.error = jest.fn();
    const result = decryptPayload(compositeHash);
    expect(result).toEqual({
      error: true,
      meessage: "failed to process Request",
    });
  });
});
