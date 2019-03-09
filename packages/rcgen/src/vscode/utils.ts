import {Patcher} from '@rcgen/core';
import {merge} from '@rcgen/patchers';
import {vscodeExtensionsFile, vscodeSettingsFile} from './files';

export function vscodeSettings(settings: object): Patcher<object> {
  return merge(vscodeSettingsFile.filename, settings);
}

export function vscodeSearchExclude(filenames: string[]): Patcher<object> {
  return merge<object>(vscodeSettingsFile.filename, {
    'search.exclude': filenames.reduce<object>(
      (filesExclude, filename) => ({...filesExclude, [filename]: true}),
      {}
    )
  });
}

export function vscodeFilesExclude(filenames: string[]): Patcher<object> {
  return merge<object>(vscodeSettingsFile.filename, {
    'files.exclude': filenames.reduce<object>(
      (filesExclude, filename) => ({...filesExclude, [filename]: false}), // TODO
      {}
    )
  });
}

export function vscodeExtensionsRecommendations(
  extensionNames: string[]
): Patcher<object> {
  return merge<object>(vscodeExtensionsFile.filename, {
    recommendations: extensionNames
  });
}
