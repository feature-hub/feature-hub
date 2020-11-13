// @ts-check

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
  coverageThreshold: {
    global: {branches: 100, functions: 100, lines: 100, statements: 100},
  },
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: 'jest-environment-puppeteer/teardown',
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  moduleNameMapper: {
    '^@feature-hub/([^/]+)$': '<rootDir>/packages/$1/src/index.ts',
  },
  modulePathIgnorePatterns: ['/lib'],
  setupFilesAfterEnv: ['expect-puppeteer'],
  testMatch: ['<rootDir>/packages/*/src/**/*.test.{ts,tsx}'],
  testURL: 'http://example.com',
};
