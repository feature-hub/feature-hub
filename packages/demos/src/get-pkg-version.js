// @ts-check

const path = require('path');
const pkgDir = require('pkg-dir');

/**
 * @param {string} pkgName
 * @param {boolean} [inFeatureHub]
 * @returns {string}
 */
function getPkgVersion(pkgName, inFeatureHub) {
  if (inFeatureHub) {
    return require(path.join(__dirname, '../..', pkgName, 'package.json'))
      .version;
  }

  const pkgDirname = pkgDir.sync(require.resolve(pkgName));

  if (!pkgDirname) {
    throw new Error(`Unknown package '${pkgName}'.`);
  }

  return require(path.join(pkgDirname, 'package.json')).version;
}

exports.getPkgVersion = getPkgVersion;
