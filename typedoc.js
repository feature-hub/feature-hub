// @ts-check

const git = require('git-rev-sync');

module.exports = {
  mode: 'modules',
  ignoreCompilerErrors: false,
  'external-modulemap': '.*packages/([^/]+)/src/.*',
  exclude: ['**/*+(__tests__|internal|lib|node_modules|demos)/**/*'],
  excludeExternals: false,
  excludeNotExported: true,
  excludePrivate: true,
  theme: 'minimal',
  gitRevision: 'master',
  readme: 'README.md',
  name: '@feature-hub',
  out: 'packages/website/build/feature-hub/@feature-hub',
  tsconfig: 'tsconfig.json',
  'sourcefile-url-prefix': `https://github.com/sinnerschrader/feature-hub/tree/${git.short()}/packages/`
};
