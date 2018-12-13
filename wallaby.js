// @ts-check

function setup({testFramework}) {
  const jestConfig = require('./jest.config');

  delete jestConfig.globalSetup;
  delete jestConfig.globalTeardown;

  testFramework.configure(jestConfig);
}

module.exports = () => ({
  files: [
    'jest.config.js',
    'scripts/setup-test-framework.js',
    'packages/*/src/**/*.{ts,tsx}',
    '!packages/*/src/**/*.test.{ts,tsx}'
  ],
  tests: [
    'packages/*/src/**/*.test.{ts,tsx}',
    '!packages/demos/src/**/*.test.{ts,tsx}'
  ],
  env: {type: 'node', runner: 'node'},
  setup,
  testFramework: 'jest'
});
