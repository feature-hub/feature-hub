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

export interface GitIgnoreOptions extends Globs {
  readonly additionalFilenames?: string[];
}

export const gitIgnoreFile: File<string[]> = {
  filename: '.gitignore',
  filetype: createLinesFiletype(),
  initialContent: []
};

export const gitFiles = [gitIgnoreFile];

export function gitIgnore(options: GitIgnoreOptions = {}): Enhancer<Manifest> {
  const {additionalFilenames = []} = options;

  return enhanceManifest({
    patchers: [
      merge(gitIgnoreFile.filename, ({otherFilenames}) =>
        [...otherFilenames, ...additionalFilenames].filter(matchFile(options))
      )
    ]
  });
}

export function git(): Enhancer<Manifest> {
  return enhanceManifest({files: [gitIgnoreFile]});
}
