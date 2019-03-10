import {Manifest} from '@rcgen/core';

export type Enhancer<T> = (value: T) => T;

export function composeEnhancers<T>(...enhancers: Enhancer<T>[]): Enhancer<T> {
  return currentValue =>
    enhancers.reduce(
      (enhancedValue, enhancer) => enhancer(enhancedValue),
      currentValue
    );
}

function mergeArrays<T>(a?: T[], b?: T[]): T[] | undefined {
  return !a ? b : !b ? a : [...a, ...b];
}

export function enhanceManifest(manifest: Manifest): Enhancer<Manifest> {
  return currentManifest => ({
    files: mergeArrays(currentManifest.files, manifest.files) || [],
    patchers: mergeArrays(currentManifest.patchers, manifest.patchers),
    includedFilenames: mergeArrays(
      currentManifest.includedFilenames,
      manifest.includedFilenames
    ),
    excludedFilenames: mergeArrays(
      currentManifest.excludedFilenames,
      manifest.excludedFilenames
    )
  });
}
