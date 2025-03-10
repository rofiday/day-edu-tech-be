import { describe, beforeEach, afterEach, jest, test } from "@jest/globals";
describe("generatePassword", () => {
  let generatePassword;
  beforeEach(async () => {
    generatePassword = (await import("@/services/generateCharacter.js"))
      .generatePassword;
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
  test("should generate a password with the default length of 12", () => {
    const password = generatePassword();
    expect(password).toHaveLength(12);
  });

  test("should generate a password with a specified length", () => {
    const length = 16;
    const password = generatePassword(length);
    expect(password).toHaveLength(length);
  });

  test("should only contain valid characters", () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const password = generatePassword(20);

    for (let char of password) {
      expect(characters).toContain(char);
    }
  });

  test("should generate different passwords each time", () => {
    const password1 = generatePassword();
    const password2 = generatePassword();
    expect(password1).not.toBe(password2);
  });
});
