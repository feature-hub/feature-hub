import {File} from '@rcgen/core';
import {createJsonFiletype, createLinesFiletype} from '@rcgen/filetypes';

export const prettierConfigFile: File<object> = {
  filename: '.prettierrc.json',
  filetype: createJsonFiletype(),
  initialContent: {},
  conflictingFilenames: [
    '.prettierrc',
    '.prettierrc.yaml',
    '.prettierrc.yml',
    '.prettierrc.js',
    '.prettierrc.toml',
    'prettier.config.js'
  ]
};

export const prettierIgnoreFile: File<string[]> = {
  filename: '.prettierignore',
  filetype: createLinesFiletype(),
  initialContent: []
};

export const prettierFiles = [prettierConfigFile, prettierIgnoreFile];
