import {Enhancer, Manifest, composeEnhancers} from '@rcgen/core';
import {prettierConfig} from './prettier';
import {vscodeSettings} from './vscode';

export interface FormatOptions {
  readonly formatOnSave?: boolean;
  readonly indentStyle?: 'tab' | 'space';
  readonly indentSize?: number;
  readonly endOfLine?: 'lf' | 'cr' | 'crlf';
}

export function format(options: FormatOptions = {}): Enhancer<Manifest> {
  const {
    formatOnSave = true,
    indentStyle = 'space',
    indentSize = 2,
    endOfLine = 'lf'
  } = options;

  return composeEnhancers([
    prettierConfig({
      useTabs:
        indentStyle === 'tab'
          ? true
          : indentStyle === 'space'
          ? false
          : undefined,
      tabWidth: indentSize,
      endOfLine
    }),
    vscodeSettings({'editor.formatOnSave': formatOnSave})
  ]);
}
