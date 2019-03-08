import {File} from '@rcgen/core';
import {createJsonFiletype, createLinesFiletype} from '@rcgen/filetypes';
import {SchemaForPrettierrc} from '@schemastore/prettierrc';
import request from 'sync-request';

export const prettierConfigFile: File<SchemaForPrettierrc> = {
  filename: '.prettierrc.json',
  filetype: createJsonFiletype({
    contentSchema: JSON.parse(
      request('GET', 'http://json.schemastore.org/prettierrc')
        .getBody()
        .toString()
    )
  }),
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
