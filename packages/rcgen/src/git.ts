import {Enhancer, File, Manifest, enhanceManifest} from '@rcgen/core';
import {createLinesFiletype} from '@rcgen/filetypes';
import {merge} from '@rcgen/patchers';

export interface EnhanceGitIgnoreOptions {
  readonly additionalFilenames?: string[];
  readonly blacklistedFilenames?: string[];
}

export const gitIgnoreFile: File<string[]> = {
  filename: '.gitignore',
  filetype: createLinesFiletype(),
  initialContent: []
};

export function enhanceGitIgnore(
  options: EnhanceGitIgnoreOptions = {}
): Enhancer<Manifest> {
  const {additionalFilenames = [], blacklistedFilenames = []} = options;

  return enhanceManifest({
    patchers: [
      merge(gitIgnoreFile.filename, ({otherFilenames}) => [
        ...otherFilenames.filter(
          otherFilename => !blacklistedFilenames.includes(otherFilename)
        ),
        ...additionalFilenames.filter(
          additionalFilename =>
            !blacklistedFilenames.includes(additionalFilename)
        )
      ])
    ]
  });
}

export function useGit(): Enhancer<Manifest> {
  return enhanceManifest({files: [gitIgnoreFile]});
}
