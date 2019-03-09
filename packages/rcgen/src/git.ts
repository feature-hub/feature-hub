import {File} from '@rcgen/core';
import {createLinesFiletype} from '@rcgen/filetypes';
import {merge} from '@rcgen/patchers';
import {
  ManifestEnhancer,
  enhanceFiles,
  enhancePatchers
} from './enhance-manifest';

export const gitIgnoreFile: File<string[]> = {
  filename: '.gitignore',
  filetype: createLinesFiletype(),
  initialContent: []
};

export function gitIgnore(...filenames: string[]): ManifestEnhancer {
  return enhancePatchers(merge(gitIgnoreFile.filename, filenames));
}

export function git(): ManifestEnhancer {
  return enhanceFiles(gitIgnoreFile);
}
