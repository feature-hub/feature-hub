// @ts-check

const {composeEnhancers} = require('@rcgen/core');
const {mergeFormat} = require('@feature-hub/rcgen/src/format');
const {enhanceGitIgnore, useGit} = require('@feature-hub/rcgen/src/git');
const {
  mergePrettierConfig,
  mergePrettierIgnore,
  usePrettier
} = require('@feature-hub/rcgen/src/prettier');
const {
  mergeVscodeExtensionsRecommendations,
  mergeVscodeFilesExclude,
  mergeVscodeSearchExclude,
  useVscode
} = require('@feature-hub/rcgen/src/vscode');

exports.default = composeEnhancers([
  useGit(),
  enhanceGitIgnore({
    additionalFilenames: [
      '.cache',
      'coverage',
      'lerna-debug.log',
      'lib',
      'node_modules',
      'npm-debug.log',
      'package-lock.json',
      'packages/website/build',
      'packages/website/i18n',
      'todo.tasks',
      'yarn-error.log'
    ]
  }),
  usePrettier({excludeInEditor: false}),
  mergePrettierConfig({
    bracketSpacing: false,
    proseWrap: 'always',
    singleQuote: true
  }),
  mergePrettierIgnore([
    '.cache',
    'CHANGELOG.md',
    'coverage',
    'lib',
    'node_modules',
    'package.json',
    'packages/website/build',
    'packages/website/i18n'
  ]),
  useVscode({excludeInEditor: false}),
  mergeVscodeExtensionsRecommendations([
    'EditorConfig.EditorConfig',
    'ms-vscode.vscode-typescript-tslint-plugin',
    'unional.vscode-sort-package-json',
    'wallabyjs.wallaby-vscode'
  ]),
  mergeVscodeFilesExclude([
    '**/.cache',
    '**/coverage',
    '**/lerna-debug.log',
    '**/lib',
    '**/node_modules',
    '**/npm-debug.log',
    '**/package-lock.json',
    '**/packages/website/build',
    '**/packages/website/i18n',
    '**/yarn-error.log'
  ]),
  mergeVscodeSearchExclude([
    '**/.cache',
    '**/CHANGELOG.md',
    '**/coverage',
    '**/lerna-debug.log',
    '**/lib',
    '**/node_modules',
    '**/npm-debug.log',
    '**/package-lock.json',
    '**/packages/website/build',
    '**/packages/website/i18n',
    '**/yarn-error.log',
    '**/yarn.lock'
  ]),
  mergeFormat()
])({});
