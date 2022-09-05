// @ts-check

const path = require('path');

function setup({projectCacheDir, testFramework}) {
  const jestConfig = require('./jest.config');

  delete jestConfig.globalSetup;
  delete jestConfig.globalTeardown;

  jestConfig.moduleNameMapper = {
    '^@feature-hub/([^/]+)$': projectCacheDir + '/packages/$1/src',
  };

  testFramework.configure(jestConfig);
}

module.exports = (wallaby) => {
  process.env.NODE_PATH +=
    path.delimiter +
    path.join(wallaby.localProjectDir, 'packages/history-service/node_modules');

  return {
    files: [
      'jest.config.js',
      'packages/*/src/**/*.{ts,tsx,snap}',
      '!packages/{dom,demos}/**/*',
      '!packages/*/src/**/*.test.{ts,tsx}',
    ],
    tests: ['packages/*/src/**/*.test.{ts,tsx}', '!packages/{dom,demos}/**/*'],
    env: {type: 'node', runner: 'node'},
    setup,
    testFramework: 'jest',
    compilers: {
      '**/*.ts?(x)': wallaby.compilers.babel(),
    },
  };
};
