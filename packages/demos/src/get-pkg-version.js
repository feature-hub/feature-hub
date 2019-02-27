// @ts-check

const path = require('path');
const pkgDir = require('pkg-dir');

/**
 * @param {string} pkgName
 * @returns {string}
 */
function getPkgVersion(pkgName) {
  const pkgDirname = pkgDir.sync(require.resolve(pkgName)) || undefined;

  if (!pkgDirname) {
    throw new Error(`Unknown package '${pkgName}'.`);
  }

  return require(path.join(pkgDirname, 'package.json')).version;
}

exports.getPkgVersion = getPkgVersion;
