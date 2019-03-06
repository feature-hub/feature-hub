// @ts-check

const {merge} = require('@rcgen/patchers');
const {prettierConfigFile, prettierIgnoreFile} = require('./files');

/**
 * @param {object} settings
 *
 * @returns {import('@rcgen/core').Patcher<object>}
 */
function configurePrettier(settings) {
  return merge(prettierConfigFile.filename, settings);
}

exports.configurePrettier = configurePrettier;

/**
 * @param {...string} filenames
 *
 * @returns {import('@rcgen/core').Patcher<string[]>}
 */
function ignoreFilesWithPrettier(...filenames) {
  return merge(prettierIgnoreFile.filename, [...filenames]);
}

exports.ignoreFilesWithPrettier = ignoreFilesWithPrettier;
