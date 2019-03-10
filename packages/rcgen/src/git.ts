import {Enhancer, File, Manifest, enhanceManifest} from '@rcgen/core';
import {createLinesFiletype} from '@rcgen/filetypes';
import {merge} from '@rcgen/patchers';

export const gitIgnoreFile: File<string[]> = {
  filename: '.gitignore',
  filetype: createLinesFiletype(),
  initialContent: []
};

export function mergeGitIgnore(...filenames: string[]): Enhancer<Manifest> {
  return enhanceManifest({
    patchers: [merge(gitIgnoreFile.filename, filenames)]
  });
}

export function useGit(): Enhancer<Manifest> {
  return enhanceManifest({files: [gitIgnoreFile]});
}
