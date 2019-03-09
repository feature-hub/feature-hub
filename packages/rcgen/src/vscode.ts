import {File} from '@rcgen/core';
import {createJsonFiletype} from '@rcgen/filetypes';
import {merge} from '@rcgen/patchers';
import {
  ManifestEnhancer,
  enhanceFiles,
  enhanceManifest,
  enhancePatchers
} from './enhance-manifest';
import {gitIgnore} from './git';

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

export function vscodeSettings(settings: object): ManifestEnhancer {
  return enhancePatchers(merge(vscodeSettingsFile.filename, settings));
}

export function vscodeSearchExclude(...filenames: string[]): ManifestEnhancer {
  return enhancePatchers(
    merge<object>(vscodeSettingsFile.filename, {
      'search.exclude': filenames.reduce<object>(
        (filesExclude, filename) => ({...filesExclude, [filename]: true}),
        {}
      )
    })
  );
}

export function vscodeFilesExclude(...filenames: string[]): ManifestEnhancer {
  return enhancePatchers(
    merge<object>(vscodeSettingsFile.filename, {
      'files.exclude': filenames.reduce<object>(
        (filesExclude, filename) => ({...filesExclude, [filename]: false}), // TODO
        {}
      )
    })
  );
}

export function vscodeExtensionsRecommendations(
  ...extensionNames: string[]
): ManifestEnhancer {
  return enhancePatchers(
    merge<object>(vscodeExtensionsFile.filename, {
      recommendations: extensionNames
    })
  );
}

const vscodeFiles = [vscodeExtensionsFile, vscodeSettingsFile];
const vscodeFilenames = vscodeFiles.map(({filename}) => filename);

export function vscode(): ManifestEnhancer {
  return enhanceManifest(
    enhanceFiles(...vscodeFiles),
    gitIgnore(...vscodeFilenames),
    vscodeFilesExclude(...vscodeFilenames),
    vscodeSearchExclude(...vscodeFilenames)
  );
}
