// @ts-check

module.exports = {
  clearMocks: true,
  collectCoverage: true,
  collectCoverageFrom: [
    '**/@feature-hub/*/src/**/*.{ts,tsx}',
    '!**/@feature-hub/browser-feature-app-module-loader/**'
  ],
  coverageThreshold: {
    global: {branches: 100, functions: 100, lines: 100, statements: 100}
  },
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  moduleNameMapper: {
    '^(@feature-hub/.+)$': '<rootDir>/$1/src'
  },
  modulePathIgnorePatterns: ['/lib'],
  setupTestFrameworkScriptFile: '<rootDir>/setup-test-framework.js',
  snapshotSerializers: ['enzyme-to-json/serializer'],
  testMatch: ['<rootDir>/@feature-hub/*/src/**/*.test.{ts,tsx}'],
  testURL: 'http://localhost',
  transform: {'\\.tsx?$': 'ts-jest'}
};
