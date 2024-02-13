// @ts-check

/**
 * @type {import('jest').Config}
 */
module.exports = {
  clearMocks: true,
  moduleFileExtensions: ['js', 'json', 'ts', 'tsx'],
  testMatch: [
    '<rootDir>/packages/*/src/**/*.test.{ts,tsx}',
    '!packages/{dom,demos}/**/*',
  ],
  transform: {'^.+\\.tsx?$': '@swc/jest'},
};
