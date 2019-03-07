// @ts-check

const {gitFiles} = require('@feature-hub/rcgen/src/git/files');
const {gitIgnore} = require('@feature-hub/rcgen/src/git/utils');
const {prettierFiles} = require('@feature-hub/rcgen/src/prettier/files');
const {prettierPatchers} = require('@feature-hub/rcgen/src/prettier/patchers');
const {
  prettierConfig,
  prettierIgnore
} = require('@feature-hub/rcgen/src/prettier/utils');
const {vscodeFiles} = require('@feature-hub/rcgen/src/vscode/files');
const {vscodePatchers} = require('@feature-hub/rcgen/src/vscode/patchers');
const {
  vscodeExtensionsRecommendations,
  vscodeFilesExclude,
  vscodeSearchExclude
} = require('@feature-hub/rcgen/src/vscode/utils');

/**
 * @type {import('@rcgen/core').Manifest}
 */
exports.default = {
  files: [...gitFiles, ...prettierFiles, ...vscodeFiles],
  patchers: [
    ...prettierPatchers,
    ...vscodePatchers,
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
  ]
};
