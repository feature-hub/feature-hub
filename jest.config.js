// @ts-check

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    '**/packages/*/src/**/*.{ts,tsx}',
    '!**/packages/demos/src/**/*.{ts,tsx}',
    // Covered by the integration test 'amd-module-loader'
    '!**/packages/module-loader/src/index.ts'
  ],
  coverageThreshold: {
    global: {branches: 100, functions: 100, lines: 100, statements: 100}
  },
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: 'jest-environment-puppeteer/teardown',
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  moduleNameMapper: {
    '^@feature-hub/([^/]+)$': '<rootDir>/packages/$1/src/index.ts',
    '^@feature-hub/module-loader/lib/(?:cjs|esm)/node$':
      '<rootDir>/packages/module-loader/src/node.ts'
  },
  modulePathIgnorePatterns: ['/lib'],
  setupTestFrameworkScriptFile: '<rootDir>/scripts/setup-test-framework.js',
  snapshotSerializers: ['enzyme-to-json/serializer'],
  testMatch: ['<rootDir>/packages/*/src/**/*.test.{ts,tsx}'],
  testURL: 'http://example.com',
  transform: {'\\.tsx?$': 'ts-jest'}
};
