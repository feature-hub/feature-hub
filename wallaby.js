// @ts-check

module.exports = () => ({
  files: [
    'scripts/setup-test-framework.js',
    'packages/*/src/**/*.{ts,tsx}',
    '!packages/*/src/**/*.test.{ts,tsx}',
    'examples/*/src/**/*.{ts,tsx}',
    '!examples/*/src/**/*.test.{ts,tsx}'
  ],
  tests: [
    'packages/*/src/**/*.test.{ts,tsx}',
    'examples/*/src/**/*.test.{ts,tsx}'
  ],
  env: {type: 'node', runner: 'node'},
  testFramework: 'jest'
});
