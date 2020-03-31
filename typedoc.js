// @ts-check

const git = require('git-rev-sync');

/**
 * @type {import('typedoc').TypeDocOptions}
 */
module.exports = {
  'external-modulemap': '.*packages/([^/]+)/src/.*',
  'sourcefile-url-prefix': `https://github.com/sinnerschrader/feature-hub/tree/${git.short()}/packages/`,
  exclude: ['**/*+(__tests__|internal|lib|node_modules|demos)/**/*'],
  excludeExternals: false,
  excludeNotExported: true,
  excludePrivate: true,
  gitRevision: 'master',
  ignoreCompilerErrors: false,
  mode: 'modules',
  name: '@feature-hub',
  out: 'packages/website/build/feature-hub/@feature-hub',
  readme: 'README.md',
  theme: 'minimal',
  tsconfig: 'tsconfig.json'
};
