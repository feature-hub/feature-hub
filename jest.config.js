// @ts-check

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    '**/packages/*/src/**/*.{ts,tsx}',
    '!**/packages/module-loader/src/index.ts'
  ],
  coverageThreshold: {
    global: {branches: 100, functions: 100, lines: 100, statements: 100}
  },
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  moduleNameMapper: {
    '^@feature-hub/([^/]+)$': '<rootDir>/packages/$1/src/index.ts',
    '^@feature-hub/([^/]+)/node$': '<rootDir>/packages/$1/src/node.ts'
  },
  modulePathIgnorePatterns: ['/lib'],
  setupTestFrameworkScriptFile: '<rootDir>/scripts/setup-test-framework.js',
  snapshotSerializers: ['enzyme-to-json/serializer'],
  testMatch: ['<rootDir>/packages/*/src/**/*.test.{ts,tsx}'],
  testURL: 'http://example.com',
  transform: {'\\.tsx?$': 'ts-jest'}
};
