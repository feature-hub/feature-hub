import {
  Enhancer,
  File,
  Globs,
  Manifest,
  enhanceManifest,
  matchFile
} from '@rcgen/core';
import {createLinesFiletype} from '@rcgen/filetypes';
import {merge} from '@rcgen/patchers';

export interface EnhanceGitIgnoreOptions extends Globs {
  readonly additionalFilenames?: string[];
}

export const gitIgnoreFile: File<string[]> = {
  filename: '.gitignore',
  filetype: createLinesFiletype(),
  initialContent: []
};

export const gitFiles = [gitIgnoreFile];

export function enhanceGitIgnore(
  options: EnhanceGitIgnoreOptions = {}
): Enhancer<Manifest> {
  const {additionalFilenames = []} = options;

  return enhanceManifest({
    patchers: [
      merge(gitIgnoreFile.filename, ({otherFilenames}) =>
        [...otherFilenames, ...additionalFilenames].filter(matchFile(options))
      )
    ]
  });
}

export function useGit(): Enhancer<Manifest> {
  return enhanceManifest({files: [gitIgnoreFile]});
}
