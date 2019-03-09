import {File, Manifest, Patcher} from '@rcgen/core';
import {pipe} from 'rambda';

export type ManifestEnhancer = (manifest?: Manifest) => Manifest;

export function enhanceManifest(
  ...manifestExtenders: ManifestEnhancer[]
): ManifestEnhancer {
  // tslint:disable-next-line: no-any
  return (pipe as any)(...manifestExtenders);
}

// tslint:disable-next-line: no-any
export function enhanceFiles(...files: File<any>[]): ManifestEnhancer {
  return (manifest = {files: []}) => ({
    ...manifest,
    files: [...manifest.files, ...files]
  });
}

// tslint:disable-next-line: no-any
export function enhancePatchers(...patchers: Patcher<any>[]): ManifestEnhancer {
  return (manifest = {files: []}) => ({
    ...manifest,
    patchers: manifest.patchers ? [...manifest.patchers, ...patchers] : patchers
  });
}
