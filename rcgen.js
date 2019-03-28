// @ts-check

const {
  git,
  gitIgnoreFiles,
  gitIgnoreIntrinsicFiles,
  node,
  npm
} = require('@rcgen/configs');
const {composeManifest} = require('@rcgen/core');

exports.default = composeManifest(
  git(),
  gitIgnoreFiles(
    '.cache',
    '.tmp',
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
  gitIgnoreIntrinsicFiles({excludedFilenamePatterns: ['package.json']}),
  node('10'),
  npm()
)();
