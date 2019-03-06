// @ts-check

const {merge} = require('@rcgen/patchers');
const {vscodeExtensionsFile, vscodeSettingsFile} = require('./files');

/**
 * @param {object} settings
 *
 * @returns {import('@rcgen/core').Patcher<object>}
 */
function configureVscode(settings) {
  return merge(vscodeSettingsFile.filename, settings);
}

exports.configureVscode = configureVscode;

/**
 * @param {...string} filenames
 *
 * @returns {import('@rcgen/core').Patcher<object>}
 */
function excludeFilesFromSearchInVscode(...filenames) {
  return merge(vscodeSettingsFile.filename, {
    'search.exclude': filenames.reduce(
      (filesExclude, filename) => ({...filesExclude, [filename]: true}),
      {}
    )
  });
}

exports.excludeFilesFromSearchInVscode = excludeFilesFromSearchInVscode;

/**
 * @param {...string} filenames
 *
 * @returns {import('@rcgen/core').Patcher<object>}
 */
function excludeFilesInVscode(...filenames) {
  return merge(vscodeSettingsFile.filename, {
    'files.exclude': filenames.reduce(
      (filesExclude, filename) => ({...filesExclude, [filename]: true}),
      {}
    )
  });
}

exports.excludeFilesInVscode = excludeFilesInVscode;

/**
 * @param {...string} extensionNames
 *
 * @returns {import('@rcgen/core').Patcher<object>}
 */
function recommendVscodeExtensions(...extensionNames) {
  return merge(vscodeExtensionsFile.filename, {
    recommendations: extensionNames
  });
}

exports.recommendVscodeExtensions = recommendVscodeExtensions;
