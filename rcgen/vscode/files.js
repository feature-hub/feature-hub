// @ts-check

const {createJsonFiletype} = require('@rcgen/filetypes');

/**
 * @type {import('@rcgen/core').File<object>}
 */
const vscodeExtensionsFile = {
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

exports.vscodeExtensionsFile = vscodeExtensionsFile;

/**
 * @type {import('@rcgen/core').File<object>}
 */
const vscodeSettingsFile = {
  filename: '.vscode/settings.json',
  filetype: createJsonFiletype(),
  initialContent: {}
};

exports.vscodeSettingsFile = vscodeSettingsFile;

exports.vscodeFiles = [vscodeExtensionsFile, vscodeSettingsFile];
