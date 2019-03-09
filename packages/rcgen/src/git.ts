import {File} from '@rcgen/core';
import {createLinesFiletype} from '@rcgen/filetypes';
import {merge} from '@rcgen/patchers';
import {
  ManifestEnhancer,
  mergeManifestFiles,
  mergeManifestPatchers
} from './core';

export const gitIgnoreFile: File<string[]> = {
  filename: '.gitignore',
  filetype: createLinesFiletype(),
  initialContent: []
};

export function mergeGitIgnore(...filenames: string[]): ManifestEnhancer {
  return mergeManifestPatchers(merge(gitIgnoreFile.filename, filenames));
}

export function useGit(): ManifestEnhancer {
  return mergeManifestFiles(gitIgnoreFile);
}
