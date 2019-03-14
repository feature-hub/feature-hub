// @ts-check

const {git, gitIgnore} = require('@rcgen/configs');
const {composeEnhancers} = require('@rcgen/core');

exports.default = composeEnhancers([
  git(),
  gitIgnore({
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
  })
])({});
