// @ts-check

/**
 * @param {string} pkgName
 * @returns {string}
 */
function getPkgVersion(pkgName) {
  const pkgJsonPath = require.resolve(`${pkgName}/package.json`);

  return require(pkgJsonPath).version;
}

exports.getPkgVersion = getPkgVersion;
