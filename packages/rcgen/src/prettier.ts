import {File} from '@rcgen/core';
import {createJsonFiletype, createLinesFiletype} from '@rcgen/filetypes';
import {merge} from '@rcgen/patchers';
import {SchemaForPrettierrc} from '@schemastore/prettierrc';
import request from 'sync-request';
import {
  ManifestEnhancer,
  enhanceFiles,
  enhanceManifest,
  enhancePatchers
} from './enhance-manifest';
import {gitIgnore} from './git';
import {
  vscodeExtensionsRecommendations,
  vscodeFilesExclude,
  vscodeSearchExclude
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

export function prettierConfig(config: SchemaForPrettierrc): ManifestEnhancer {
  return enhancePatchers(merge(prettierConfigFile.filename, config));
}

export function prettierIgnore(...filenames: string[]): ManifestEnhancer {
  return enhancePatchers(merge(prettierIgnoreFile.filename, filenames));
}

const prettierFiles = [prettierConfigFile, prettierIgnoreFile];
const prettierFilenames = prettierFiles.map(({filename}) => filename);

export function prettier(): ManifestEnhancer {
  return enhanceManifest(
    enhanceFiles(...prettierFiles),
    gitIgnore(...prettierFilenames),
    vscodeExtensionsRecommendations('esbenp.prettier-vscode'),
    vscodeFilesExclude(...prettierFilenames),
    vscodeSearchExclude(...prettierFilenames)
  );
}
