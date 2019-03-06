// @ts-check

const {ignoreFilesWithGit} = require('../git/utils');
const {vscodeFiles} = require('./files');
const {
  excludeFilesFromSearchInVscode,
  excludeFilesInVscode
} = require('./utils');

const vscodeFilenames = vscodeFiles.map(({filename}) => filename);

exports.vscodePatchers = [
  ignoreFilesWithGit(...vscodeFilenames),
  excludeFilesFromSearchInVscode(...vscodeFilenames),
  excludeFilesInVscode(...vscodeFilenames)
];
