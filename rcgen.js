// @ts-check

const {composeEnhancers} = require('@rcgen/core');
const {enhanceFormat} = require('@feature-hub/rcgen/src/format');
const {
  enhanceGitIgnore,
  gitFiles,
  useGit
} = require('@feature-hub/rcgen/src/git');
const {
  enhancePrettierConfig,
  enhancePrettierIgnore,
  prettierFiles,
  usePrettier
} = require('@feature-hub/rcgen/src/prettier');
const {
  enhanceVscodeExtensions,
  enhanceVscodeFilesExclude,
  enhanceVscodeSearchExclude,
  useVscode,
  vscodeFiles
} = require('@feature-hub/rcgen/src/vscode');

const additionalFilenames = [
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
  usePrettier(),
  useVscode(),

  enhanceGitIgnore({
    additionalFilenames: [...additionalFilenames, 'todo.tasks']
  }),

  enhanceFormat(),

  enhancePrettierConfig({
    bracketSpacing: false,
    proseWrap: 'always',
    singleQuote: true
  }),
  enhancePrettierIgnore({
    additionalFilenames: [
      ...additionalFilenames,
      'CHANGELOG.md',
      'package.json'
    ]
  }),

  enhanceVscodeExtensions([
    'EditorConfig.EditorConfig',
    'ms-vscode.vscode-typescript-tslint-plugin',
    'unional.vscode-sort-package-json',
    'wallabyjs.wallaby-vscode'
  ]),
  enhanceVscodeFilesExclude({
    additionalFilenames: [
      ...additionalFilenames.map(filename => `**/${filename}`)
    ],
    excludedFilenamePatterns: [
      ...gitFiles,
      ...prettierFiles,
      ...vscodeFiles
    ].map(({filename}) => filename)
  }),
  enhanceVscodeSearchExclude({
    additionalFilenames: [
      ...additionalFilenames.map(filename => `**/${filename}`),
      '**/CHANGELOG.md',
      '**/yarn.lock'
    ]
  })
])({});
