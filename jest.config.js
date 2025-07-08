const nextJest = require("next/jest");

const createJestConfig = nextJest({
  dir: "./",
});

const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/__tests__/setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  testPathIgnorePatterns: ["<rootDir>/__tests__/setup.ts"],
};

module.exports = createJestConfig(customJestConfig);
