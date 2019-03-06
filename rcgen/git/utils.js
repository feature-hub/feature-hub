// @ts-check

const {gitIgnoreFile} = require('./files');
const {merge} = require('@rcgen/patchers');

/**
 * @param {...string} filenames
 *
 * @returns {import('@rcgen/core').Patcher<string[]>}
 */
function ignoreFilesWithGit(...filenames) {
  return merge(gitIgnoreFile.filename, [...filenames]);
}

exports.ignoreFilesWithGit = ignoreFilesWithGit;
