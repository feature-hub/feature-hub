// @ts-check

/**
 * @type {import('jest').Config}
 */
module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    '**/packages/*/src/**/*.{ts,tsx}',
    '!**/packages/demos/src/**/*.{ts,tsx}',
    // Covered by the integration test 'integrator-dom'
    '!**/packages/dom/src/**/*.{ts,tsx}',
    // Covered by the integration test 'module-loader-amd'
    '!**/packages/module-loader-amd/src/index.ts',
  ],
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: 'jest-environment-puppeteer/teardown',
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  moduleNameMapper: {
    '^@feature-hub/([^/]+)$': '<rootDir>/packages/$1/src/index.ts',
  },
  modulePathIgnorePatterns: ['/lib'],
  setupFilesAfterEnv: ['expect-puppeteer'],
  testMatch: ['<rootDir>/packages/*/src/**/*.test.{ts,tsx}'],
  transform: {'^.+\\.tsx?$': '@swc/jest'},
};
