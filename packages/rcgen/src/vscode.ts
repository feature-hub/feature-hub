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

export interface EnhanceVscodeFilesExcludeOptions extends Globs {
  readonly externalFilenames?: string[];
}

export interface EnhanceVscodeSearchExcludeOptions extends Globs {
  readonly externalFilenames?: string[];
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

export function enhanceVscodeSettings(settings: object): Enhancer<Manifest> {
  return enhanceManifest({
    patchers: [merge(vscodeSettingsFile.filename, () => settings)]
  });
}

export function enhanceVscodeFilesExclude(
  options: EnhanceVscodeFilesExcludeOptions = {}
): Enhancer<Manifest> {
  const {externalFilenames = []} = options;

  return enhanceManifest({
    patchers: [
      merge(vscodeSettingsFile.filename, ({otherFilenames}) => ({
        'files.exclude': [
          ...otherFilenames,
          ...externalFilenames,
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

export function enhanceVscodeSearchExclude(
  options: EnhanceVscodeSearchExcludeOptions = {}
): Enhancer<Manifest> {
  const {externalFilenames = []} = options;

  return enhanceManifest({
    patchers: [
      merge(vscodeSettingsFile.filename, ({otherFilenames}) => ({
        'search.exclude': [
          ...otherFilenames,
          ...externalFilenames,
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

export function enhanceVscodeExtensions(
  recommendations: string[]
): Enhancer<Manifest> {
  return enhanceManifest({
    patchers: [merge(vscodeExtensionsFile.filename, () => ({recommendations}))]
  });
}

export function useVscode(): Enhancer<Manifest> {
  return enhanceManifest({files: [vscodeExtensionsFile, vscodeSettingsFile]});
}
