// @ts-check

const git = require('git-rev-sync');

/**
 * @type {import('typedoc').TypeDocOptions}
 */
module.exports = {
  entryPointStrategy: 'Packages',
  exclude: [
    '**/*+(__tests__|internal|lib|node_modules)/**/*',
    'packages/website',
    'packages/demos',
  ],
  excludeExternals: false,
  excludePrivate: true,
  gitRevision: git.short(),
  name: '@feature-hub',
  out: 'packages/website/build/feature-hub/api',
  readme: 'README.md',
  tsconfig: 'tsconfig.json',
};
