import {File} from '@rcgen/core';
import {createJsonFiletype} from '@rcgen/filetypes';
import {merge} from '@rcgen/patchers';
import {
  ManifestEnhancer,
  enhanceManifest,
  mergeManifestFiles,
  mergeManifestPatchers
} from './core';
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

export function mergeVscodeSettings(settings: object): ManifestEnhancer {
  return mergeManifestPatchers(merge(vscodeSettingsFile.filename, settings));
}

export function mergeVscodeSearchExclude(
  ...filenames: string[]
): ManifestEnhancer {
  return mergeManifestPatchers(
    merge<object>(vscodeSettingsFile.filename, {
      'search.exclude': filenames.reduce<object>(
        (filesExclude, filename) => ({...filesExclude, [filename]: true}),
        {}
      )
    })
  );
}

export function mergeVscodeFilesExclude(
  ...filenames: string[]
): ManifestEnhancer {
  return mergeManifestPatchers(
    merge<object>(vscodeSettingsFile.filename, {
      'files.exclude': filenames.reduce<object>(
        (filesExclude, filename) => ({...filesExclude, [filename]: false}), // TODO
        {}
      )
    })
  );
}

export function mergeVscodeExtensionsRecommendations(
  ...extensionNames: string[]
): ManifestEnhancer {
  return mergeManifestPatchers(
    merge<object>(vscodeExtensionsFile.filename, {
      recommendations: extensionNames
    })
  );
}

const vscodeFiles = [vscodeExtensionsFile, vscodeSettingsFile];
const vscodeFilenames = vscodeFiles.map(({filename}) => filename);

export function useVscode(): ManifestEnhancer {
  return enhanceManifest(
    mergeManifestFiles(...vscodeFiles),
    mergeGitIgnore(...vscodeFilenames),
    mergeVscodeFilesExclude(...vscodeFilenames),
    mergeVscodeSearchExclude(...vscodeFilenames)
  );
}
