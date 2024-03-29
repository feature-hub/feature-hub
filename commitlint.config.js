// @ts-check

const {readdirSync} = require('fs');
const path = require('path');

const pkgScopes = readdirSync(path.join(__dirname, 'packages')).filter(
  (scope) => !/^\./.test(scope),
);

const scopes = ['all', ...pkgScopes];

module.exports = {
  extends: ['@commitlint/config-angular'],
  rules: {
    'header-max-length': [2, 'always', 140],
    'scope-empty': [2, 'never'],
    'scope-enum': [2, 'always', scopes],
  },
};
