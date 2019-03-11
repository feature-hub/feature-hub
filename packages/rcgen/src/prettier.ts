import {
  Enhancer,
  File,
  Globs,
  Manifest,
  composeEnhancers,
  enhanceManifest,
  matchFile
} from '@rcgen/core';
import {createJsonFiletype, createLinesFiletype} from '@rcgen/filetypes';
import {merge} from '@rcgen/patchers';
import {SchemaForPrettierrc} from '@schemastore/prettierrc';
import request from 'sync-request';
import {enhanceVscodeExtensions} from './vscode';

export interface EnhancePrettierIgnoreOptions extends Globs {
  readonly additionalFilenames?: string[];
}

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

export function enhancePrettierConfig(
  config: SchemaForPrettierrc
): Enhancer<Manifest> {
  return enhanceManifest({
    patchers: [merge(prettierConfigFile.filename, () => config)]
  });
}

export function enhancePrettierIgnore(
  options: EnhancePrettierIgnoreOptions = {}
): Enhancer<Manifest> {
  const {additionalFilenames = []} = options;

  return enhanceManifest({
    patchers: [
      merge(prettierIgnoreFile.filename, ({otherFilenames}) =>
        [...otherFilenames, ...additionalFilenames]
          .filter(matchFile(options))
          .filter(filename => filename !== prettierConfigFile.filename)
      )
    ]
  });
}

export function usePrettier(): Enhancer<Manifest> {
  return composeEnhancers([
    enhanceManifest({files: [prettierConfigFile, prettierIgnoreFile]}),
    enhanceVscodeExtensions(['esbenp.prettier-vscode'])
  ]);
}
