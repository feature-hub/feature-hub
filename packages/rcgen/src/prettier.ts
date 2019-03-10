import {
  Enhancer,
  File,
  Manifest,
  composeEnhancers,
  enhanceManifest
} from '@rcgen/core';
import {createJsonFiletype, createLinesFiletype} from '@rcgen/filetypes';
import {merge} from '@rcgen/patchers';
import {SchemaForPrettierrc} from '@schemastore/prettierrc';
import request from 'sync-request';
import {mergeGitIgnore} from './git';
import {
  mergeVscodeExtensionsRecommendations,
  mergeVscodeFilesExclude,
  mergeVscodeSearchExclude
} from './vscode';

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

export function mergePrettierConfig(
  config: SchemaForPrettierrc
): Enhancer<Manifest> {
  return enhanceManifest({
    patchers: [merge(prettierConfigFile.filename, config)]
  });
}

export function mergePrettierIgnore(
  ...filenames: string[]
): Enhancer<Manifest> {
  return enhanceManifest({
    patchers: [merge(prettierIgnoreFile.filename, filenames)]
  });
}

const prettierFiles = [prettierConfigFile, prettierIgnoreFile];
const prettierFilenames = prettierFiles.map(({filename}) => filename);

// TODO: options.hideInEditor & options.ignoreInGit
export function usePrettier(): Enhancer<Manifest> {
  return composeEnhancers(
    enhanceManifest({files: prettierFiles}),
    mergeGitIgnore(...prettierFilenames),
    mergeVscodeExtensionsRecommendations('esbenp.prettier-vscode'),
    mergeVscodeFilesExclude(...prettierFilenames),
    mergeVscodeSearchExclude(...prettierFilenames)
  );
}
