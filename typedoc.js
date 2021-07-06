// @ts-check

const git = require('git-rev-sync');

/**
 * @type {import('typedoc').TypeDocOptions}
 */
module.exports = {
  'external-modulemap': '.*packages/([^/]+)/src/.*',
  'sourcefile-url-prefix': `https://github.com/sinnerschrader/feature-hub/tree/${git.short()}/packages/`,
  exclude: ['**/*+(__tests__|internal|lib|node_modules|demos|website)/**/*'],
  excludeExternals: false,
  excludePrivate: true,
  gitRevision: 'master',
  name: '@feature-hub',
  out: 'packages/website/build/feature-hub/api',
  readme: 'README.md',
  theme: 'minimal',
  tsconfig: 'tsconfig.json',
};
