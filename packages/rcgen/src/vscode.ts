import {
  Enhancer,
  File,
  Manifest,
  composeEnhancers,
  enhanceManifest
} from '@rcgen/core';
import {createJsonFiletype} from '@rcgen/filetypes';
import {merge} from '@rcgen/patchers';
import {mergeGitIgnore} from './git';

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

export function mergeVscodeSettings(settings: object): Enhancer<Manifest> {
  return enhanceManifest({
    patchers: [merge(vscodeSettingsFile.filename, settings)]
  });
}

export function mergeVscodeSearchExclude(
  ...filenames: string[]
): Enhancer<Manifest> {
  return enhanceManifest({
    patchers: [
      merge<object>(vscodeSettingsFile.filename, {
        'search.exclude': filenames.reduce<object>(
          (filesExclude, filename) => ({...filesExclude, [filename]: true}),
          {}
        )
      })
    ]
  });
}

export function mergeVscodeFilesExclude(
  ...filenames: string[]
): Enhancer<Manifest> {
  return enhanceManifest({
    patchers: [
      merge<object>(vscodeSettingsFile.filename, {
        'files.exclude': filenames.reduce<object>(
          (filesExclude, filename) => ({...filesExclude, [filename]: true}),
          {}
        )
      })
    ]
  });
}

export function mergeVscodeExtensionsRecommendations(
  ...extensionNames: string[]
): Enhancer<Manifest> {
  return enhanceManifest({
    patchers: [
      merge<object>(vscodeExtensionsFile.filename, {
        recommendations: extensionNames
      })
    ]
  });
}

const vscodeFiles = [vscodeExtensionsFile, vscodeSettingsFile];
const vscodeFilenames = vscodeFiles.map(({filename}) => filename);

export interface VscodeOptions {
  readonly excludeInEditor?: boolean;
  readonly ignoreInGit?: boolean;
}

export function useVscode(options: VscodeOptions = {}): Enhancer<Manifest> {
  const {excludeInEditor = true, ignoreInGit = true} = options;

  return composeEnhancers(
    enhanceManifest({files: vscodeFiles}),
    ignoreInGit ? mergeGitIgnore(...vscodeFilenames) : enhanceManifest({}),
    excludeInEditor
      ? mergeVscodeFilesExclude(...vscodeFilenames)
      : enhanceManifest({}),
    excludeInEditor
      ? mergeVscodeSearchExclude(...vscodeFilenames)
      : enhanceManifest({})
  );
}
