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
  readonly externalFilenames?: string[];
}

export const gitIgnoreFile: File<string[]> = {
  filename: '.gitignore',
  filetype: createLinesFiletype(),
  initialContent: []
};

export function enhanceGitIgnore(
  options: EnhanceGitIgnoreOptions = {}
): Enhancer<Manifest> {
  const {externalFilenames = []} = options;

  return enhanceManifest({
    patchers: [
      merge(gitIgnoreFile.filename, ({otherFilenames}) =>
        [...otherFilenames, ...externalFilenames].filter(matchFile(options))
      )
    ]
  });
}

export function useGit(): Enhancer<Manifest> {
  return enhanceManifest({files: [gitIgnoreFile]});
}
