// @ts-check

const {gitFiles} = require('./rcgen/git/files');
const {ignoreFilesWithGit} = require('./rcgen/git/utils');
const {prettierFiles} = require('./rcgen/prettier/files');
const {prettierPatchers} = require('./rcgen/prettier/patchers');
const {
  configurePrettier,
  ignoreFilesWithPrettier
} = require('./rcgen/prettier/utils');
const {vscodeFiles} = require('./rcgen/vscode/files');
const {vscodePatchers} = require('./rcgen/vscode/patchers');
const {
  excludeFilesFromSearchInVscode,
  excludeFilesInVscode,
  recommendVscodeExtensions
} = require('./rcgen/vscode/utils');

/**
 * @type {import('@rcgen/core').Manifest}
 */
exports.default = {
  files: [...gitFiles, ...prettierFiles, ...vscodeFiles],
  patchers: [
    ...prettierPatchers,
    ...vscodePatchers,
    ignoreFilesWithGit(
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
    configurePrettier({
      bracketSpacing: false,
      proseWrap: 'always',
      singleQuote: true
    }),
    ignoreFilesWithPrettier(
      '.cache',
      'CHANGELOG.md',
      'coverage',
      'lib',
      'node_modules',
      'package.json',
      'packages/website/build',
      'packages/website/i18n'
    ),
    excludeFilesFromSearchInVscode(
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
    excludeFilesInVscode(
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
    recommendVscodeExtensions(
      'EditorConfig.EditorConfig',
      'ms-vscode.vscode-typescript-tslint-plugin',
      'unional.vscode-sort-package-json',
      'wallabyjs.wallaby-vscode'
    )
  ]
};
