// @ts-check

const {
  createLinesFiletype,
  createNodeModuleFiletype
} = require('@rcgen/filetypes');

/**
 * @type {import('@rcgen/core').File<object>}
 */
const prettierConfigFile = {
  filename: '.prettierrc.js',
  filetype: createNodeModuleFiletype(),
  initialContent: {},
  conflictingFilenames: [
    '.prettierrc',
    '.prettierrc.yaml',
    '.prettierrc.yml',
    '.prettierrc.json',
    '.prettierrc.toml',
    'prettier.config.js'
  ]
};

exports.prettierConfigFile = prettierConfigFile;

/**
 * @type {import('@rcgen/core').File<string[]>}
 */
const prettierIgnoreFile = {
  filename: '.prettierignore',
  filetype: createLinesFiletype(),
  initialContent: []
};

exports.prettierIgnoreFile = prettierIgnoreFile;

exports.prettierFiles = [prettierConfigFile, prettierIgnoreFile];
