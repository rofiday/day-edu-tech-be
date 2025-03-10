import { generateRandomCharacters } from "@/utils/character.util.js";
import { describe, test } from "@jest/globals";

describe("generateRandomCharacters", () => {
  test("should generate a string with the default length of 12", () => {
    const randomString = generateRandomCharacters();
    expect(randomString).toHaveLength(12);
  });

  test("should generate a string with the specified length", () => {
    const length = 16;
    const randomString = generateRandomCharacters(length);
    expect(randomString).toHaveLength(length);
  });

  test("should contain only alphanumeric characters", () => {
    const randomString = generateRandomCharacters(20);
    expect(randomString).toMatch(/^[A-Za-z0-9]+$/);
  });

  test("should generate different strings on multiple calls", () => {
    const string1 = generateRandomCharacters();
    const string2 = generateRandomCharacters();
    expect(string1).not.toBe(string2);
  });
});
