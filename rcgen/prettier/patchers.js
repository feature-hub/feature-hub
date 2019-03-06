// @ts-check

const {ignoreFilesWithGit} = require('../git/utils');
const {
  configureVscode,
  excludeFilesFromSearchInVscode,
  excludeFilesInVscode,
  recommendVscodeExtensions
} = require('../vscode/utils');
const {prettierFiles} = require('./files');

const prettierFilenames = prettierFiles.map(({filename}) => filename);

exports.prettierPatchers = [
  ignoreFilesWithGit(...prettierFilenames),
  excludeFilesFromSearchInVscode(...prettierFilenames),
  excludeFilesInVscode(...prettierFilenames),
  recommendVscodeExtensions('esbenp.prettier-vscode'),
  configureVscode({'editor.formatOnSave': true})
];
