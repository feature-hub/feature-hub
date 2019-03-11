import {
  Enhancer,
  File,
  Globs,
  Manifest,
  enhanceManifest,
  matchFile
} from '@rcgen/core';
import {createJsonFiletype} from '@rcgen/filetypes';
import {merge} from '@rcgen/patchers';

export interface VscodeFilesExcludeOptions extends Globs {
  readonly additionalFilenames?: string[];
}

export interface VscodeSearchExcludeOptions extends Globs {
  readonly additionalFilenames?: string[];
}

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

export function vscodeSettings(settings: object): Enhancer<Manifest> {
  return enhanceManifest({
    patchers: [merge(vscodeSettingsFile.filename, () => settings)]
  });
}

export function vscodeFilesExclude(
  options: VscodeFilesExcludeOptions = {}
): Enhancer<Manifest> {
  const {additionalFilenames = []} = options;

  return enhanceManifest({
    patchers: [
      merge(vscodeSettingsFile.filename, ({otherFilenames}) => ({
        'files.exclude': [
          ...otherFilenames,
          ...additionalFilenames,
          vscodeSettingsFile.filename
        ]
          .filter(matchFile(options))
          .reduce<object>(
            (filesExclude, filename) => ({...filesExclude, [filename]: true}),
            {}
          )
      }))
    ]
  });
}

export function vscodeSearchExclude(
  options: VscodeSearchExcludeOptions = {}
): Enhancer<Manifest> {
  const {additionalFilenames = []} = options;

  return enhanceManifest({
    patchers: [
      merge(vscodeSettingsFile.filename, ({otherFilenames}) => ({
        'search.exclude': [
          ...otherFilenames,
          ...additionalFilenames,
          vscodeSettingsFile.filename
        ]
          .filter(matchFile(options))
          .reduce<object>(
            (searchExclude, filename) => ({...searchExclude, [filename]: true}),
            {}
          )
      }))
    ]
  });
}

export function vscodeExtensions(
  recommendations: string[]
): Enhancer<Manifest> {
  return enhanceManifest({
    patchers: [merge(vscodeExtensionsFile.filename, () => ({recommendations}))]
  });
}

export function initVscode(): Enhancer<Manifest> {
  return enhanceManifest({files: [vscodeExtensionsFile, vscodeSettingsFile]});
}
