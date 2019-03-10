// @ts-check

const {composeEnhancers} = require('@feature-hub/rcgen/src/core');
const {mergeFormat} = require('@feature-hub/rcgen/src/format');
const {mergeGitIgnore, useGit} = require('@feature-hub/rcgen/src/git');
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

exports.default = composeEnhancers(
  useGit(),
  mergeGitIgnore(
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
  ),
  usePrettier(),
  mergePrettierConfig({
    bracketSpacing: false,
    proseWrap: 'always',
    singleQuote: true
  }),
  mergePrettierIgnore(
    '.cache',
    'CHANGELOG.md',
    'coverage',
    'lib',
    'node_modules',
    'package.json',
    'packages/website/build',
    'packages/website/i18n'
  ),
  useVscode(),
  mergeVscodeExtensionsRecommendations(
    'EditorConfig.EditorConfig',
    'ms-vscode.vscode-typescript-tslint-plugin',
    'unional.vscode-sort-package-json',
    'wallabyjs.wallaby-vscode'
  ),
  mergeVscodeFilesExclude(
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
  ),
  mergeVscodeSearchExclude(
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
  ),
  mergeFormat()
)({files: []}); // TODO: remove files property with next rcgen version
