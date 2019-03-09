import {ManifestEnhancer, enhanceManifest} from './enhance-manifest';
import {prettierConfig} from './prettier';
import {vscodeSettings} from './vscode';

export interface FormatOptions {
  readonly onSave?: boolean;
  readonly useTabs?: boolean;
  readonly tabWidth?: number;
  readonly endOfLine?: 'lf' | 'cr' | 'crlf';
}

export function format(options: FormatOptions = {}): ManifestEnhancer {
  const {
    onSave = true,
    useTabs = false,
    tabWidth = 2,
    endOfLine = 'lf'
  } = options;

  return enhanceManifest(
    vscodeSettings({'editor.formatOnSave': onSave}),
    prettierConfig({useTabs, tabWidth, endOfLine})
  );
}
