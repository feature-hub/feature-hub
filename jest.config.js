// @ts-check

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    '**/packages/*/src/**/*.{ts,tsx}',
    '!**/packages/module-loader/src/browser.ts'
  ],
  coverageThreshold: {
    global: {branches: 100, functions: 100, lines: 100, statements: 100}
  },
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  moduleNameMapper: {
    '^(packages/.+)$': '<rootDir>/$1/src'
  },
  modulePathIgnorePatterns: ['/lib'],
  setupTestFrameworkScriptFile: '<rootDir>/scripts/setup-test-framework.js',
  snapshotSerializers: ['enzyme-to-json/serializer'],
  testMatch: ['<rootDir>/packages/*/src/**/*.test.{ts,tsx}'],
  testURL: 'http://localhost',
  transform: {'\\.tsx?$': 'ts-jest'}
};
