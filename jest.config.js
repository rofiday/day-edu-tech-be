export default {
  rootDir: ".",
  testEnvironment: "node",
  testTimeout: 5000,
  moduleDirectories: ["node_modules"],
  coverageDirectory: "coverage",
  collectCoverage: true,
  collectCoverageFrom: [
    "src/controllers/**/*.js",
    "src/services/**/*.js",
    "src/utils/**/*.js",
    "!src/routes/**/*.js",
    "!src/**/server.js",
    "!**/node_modules/**",
  ],
  testMatch: ["**/__tests__/**/*.test.js"],
  coverageReporters: ["json", "lcov", "text", "clover"],
  transform: {},
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFiles: ["dotenv/config", "module-alias/register"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
