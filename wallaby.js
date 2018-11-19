// @ts-check

module.exports = () => ({
  files: [
    'setup-test-framework.js',
    '@feature-hub/*/src/**/*.{ts,tsx}',
    '!@feature-hub/*/src/**/*.test.{ts,tsx}'
  ],
  tests: ['@feature-hub/*/src/**/*.test.{ts,tsx}'],
  env: {type: 'node', runner: 'node'},
  testFramework: 'jest'
});
