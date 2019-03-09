import {File, Manifest, Patcher} from '@rcgen/core';
import {pipe} from 'rambda';

export type ManifestEnhancer = (manifest?: Manifest) => Manifest;

export function enhanceManifest(
  ...manifestEnhancers: ManifestEnhancer[]
): ManifestEnhancer {
  // tslint:disable-next-line: no-any
  return (pipe as any)(...manifestEnhancers);
}

// tslint:disable-next-line: no-any
export function mergeManifestFiles(...files: File<any>[]): ManifestEnhancer {
  return (manifest = {files: []}) => ({
    ...manifest,
    files: [...manifest.files, ...files]
  });
}

export function mergeManifestPatchers(
  ...patchers: Patcher<any>[] // tslint:disable-line: no-any
): ManifestEnhancer {
  return (manifest = {files: []}) => ({
    ...manifest,
    patchers: manifest.patchers ? [...manifest.patchers, ...patchers] : patchers
  });
}
