// @ts-check

const {enhanceManifest} = require('@feature-hub/rcgen/src/enhance-manifest');
const {format} = require('@feature-hub/rcgen/src/format');
const {git, gitIgnore} = require('@feature-hub/rcgen/src/git');
const {
  prettier,
  prettierConfig,
  prettierIgnore
} = require('@feature-hub/rcgen/src/prettier');
const {
  vscode,
  vscodeExtensionsRecommendations,
  vscodeFilesExclude,
  vscodeSearchExclude
} = require('@feature-hub/rcgen/src/vscode');

exports.default = enhanceManifest(
  format(),
  git(),
  gitIgnore(
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
  prettier(),
  prettierConfig({
    bracketSpacing: false,
    proseWrap: 'always',
    singleQuote: true
  }),
  prettierIgnore(
    '.cache',
    'CHANGELOG.md',
    'coverage',
    'lib',
    'node_modules',
    'package.json',
    'packages/website/build',
    'packages/website/i18n'
  ),
  vscode(),
  vscodeExtensionsRecommendations(
    'EditorConfig.EditorConfig',
    'ms-vscode.vscode-typescript-tslint-plugin',
    'unional.vscode-sort-package-json',
    'wallabyjs.wallaby-vscode'
  ),
  vscodeFilesExclude(
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
  vscodeSearchExclude(
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
  )
)();
