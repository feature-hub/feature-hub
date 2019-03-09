import {ManifestEnhancer, enhanceManifest} from './core';
import {mergePrettierConfig} from './prettier';
import {mergeVscodeSettings} from './vscode';

export interface FormatOptions {
  readonly formatOnSave?: boolean;
  readonly indentStyle?: 'tab' | 'space';
  readonly indentSize?: number;
  readonly endOfLine?: 'lf' | 'cr' | 'crlf';
}

export function mergeFormat(options: FormatOptions = {}): ManifestEnhancer {
  const {
    formatOnSave = true,
    indentStyle = 'space',
    indentSize = 2,
    endOfLine = 'lf'
  } = options;

  return enhanceManifest(
    mergePrettierConfig({
      useTabs:
        indentStyle === 'tab'
          ? true
          : indentStyle === 'space'
          ? false
          : undefined,
      tabWidth: indentSize,
      endOfLine
    }),
    mergeVscodeSettings({'editor.formatOnSave': formatOnSave})
  );
}
