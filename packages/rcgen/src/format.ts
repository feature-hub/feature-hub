import {ManifestEnhancer, enhanceManifest} from './core';
import {mergePrettierConfig} from './prettier';
import {mergeVscodeSettings} from './vscode';

export interface FormatOptions {
  readonly onSave?: boolean;
  readonly useTabs?: boolean;
  readonly tabWidth?: number;
  readonly endOfLine?: 'lf' | 'cr' | 'crlf';
}

export function mergeFormat(options: FormatOptions = {}): ManifestEnhancer {
  const {
    onSave = true,
    useTabs = false,
    tabWidth = 2,
    endOfLine = 'lf'
  } = options;

  return enhanceManifest(
    mergePrettierConfig({useTabs, tabWidth, endOfLine}),
    mergeVscodeSettings({'editor.formatOnSave': onSave})
  );
}
