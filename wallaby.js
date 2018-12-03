// @ts-check

module.exports = () => ({
  files: [
    'scripts/setup-test-framework.js',
    '{packages,examples}/*/src/**/*.{ts,tsx}',
    '!{packages,examples}/*/src/**/*.test.{ts,tsx}'
  ],
  tests: ['{packages,examples}/*/src/**/*.test.{ts,tsx}'],
  env: {type: 'node', runner: 'node'},
  testFramework: 'jest'
});
