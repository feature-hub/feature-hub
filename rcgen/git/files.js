// @ts-check

const {createLinesFiletype} = require('@rcgen/filetypes');

/**
 * @type {import('@rcgen/core').File<string[]>}
 */
const gitIgnoreFile = {
  filename: '.gitignore',
  filetype: createLinesFiletype(),
  initialContent: []
};

exports.gitIgnoreFile = gitIgnoreFile;

exports.gitFiles = [gitIgnoreFile];
