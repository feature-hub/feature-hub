// @ts-check

const {composeEnhancers} = require('@rcgen/core');
const {enhanceFormat} = require('@feature-hub/rcgen/src/format');
const {
  enhanceGitIgnore,
  gitIgnoreFile,
  useGit
} = require('@feature-hub/rcgen/src/git');
const {
  enhancePrettierConfig,
  enhancePrettierIgnore,
  prettierConfigFile,
  prettierIgnoreFile,
  usePrettier
} = require('@feature-hub/rcgen/src/prettier');
const {
  enhanceVscodeExtensions,
  enhanceVscodeFilesExclude,
  enhanceVscodeSearchExclude,
  useVscode,
  vscodeExtensionsFile,
  vscodeSettingsFile
} = require('@feature-hub/rcgen/src/vscode');

const commonExternalFilenames = [
  '.cache',
  'coverage',
  'lerna-debug.log',
  'lib',
  'node_modules',
  'npm-debug.log',
  'package-lock.json',
  'packages/website/build',
  'packages/website/i18n',
  'yarn-error.log'
];

exports.default = composeEnhancers([
  useGit(),
  enhanceGitIgnore({
    externalFilenames: [...commonExternalFilenames, 'todo.tasks']
  }),
  usePrettier(),
  enhancePrettierConfig({
    bracketSpacing: false,
    proseWrap: 'always',
    singleQuote: true
  }),
  enhancePrettierIgnore({
    externalFilenames: [
      ...commonExternalFilenames,
      'CHANGELOG.md',
      'package.json'
    ]
  }),
  useVscode(),
  enhanceVscodeExtensions([
    'EditorConfig.EditorConfig',
    'ms-vscode.vscode-typescript-tslint-plugin',
    'unional.vscode-sort-package-json',
    'wallabyjs.wallaby-vscode'
  ]),
  enhanceVscodeFilesExclude({
    externalFilenames: [
      ...commonExternalFilenames.map(filename => `**/${filename}`)
    ],
    excludedFilenamePatterns: [
      gitIgnoreFile,
      prettierConfigFile,
      prettierIgnoreFile,
      vscodeExtensionsFile,
      vscodeSettingsFile
    ].map(({filename}) => filename)
  }),
  enhanceVscodeSearchExclude({
    externalFilenames: [
      ...commonExternalFilenames.map(filename => `**/${filename}`),
      '**/CHANGELOG.md',
      '**/yarn.lock'
    ]
  }),
  enhanceFormat()
])({});
