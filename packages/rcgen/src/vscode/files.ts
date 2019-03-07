import {File} from '@rcgen/core';
import {createJsonFiletype} from '@rcgen/filetypes';

export const vscodeExtensionsFile: File<object> = {
  filename: '.vscode/extensions.json',
  filetype: createJsonFiletype({
    contentSchema: {
      type: 'object',
      properties: {recommendations: {type: 'array', items: {type: 'string'}}},
      required: ['recommendations'],
      additionalProperties: false
    }
  }),
  initialContent: {recommendations: []}
};

export const vscodeSettingsFile: File<object> = {
  filename: '.vscode/settings.json',
  filetype: createJsonFiletype(),
  initialContent: {}
};

export const vscodeFiles = [vscodeExtensionsFile, vscodeSettingsFile];
