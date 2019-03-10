import {Enhancer, Manifest, composeEnhancers} from '@rcgen/core';
import {enhancePrettierConfig} from './prettier';
import {enhanceVscodeSettings} from './vscode';

export interface EnhanceFormatOptions {
  readonly formatOnSave?: boolean;
  readonly indentStyle?: 'tab' | 'space';
  readonly indentSize?: number;
  readonly endOfLine?: 'lf' | 'cr' | 'crlf';
}

export function enhanceFormat(
  options: EnhanceFormatOptions = {}
): Enhancer<Manifest> {
  const {
    formatOnSave = true,
    indentStyle = 'space',
    indentSize = 2,
    endOfLine = 'lf'
  } = options;

  return composeEnhancers([
    enhancePrettierConfig({
      useTabs:
        indentStyle === 'tab'
          ? true
          : indentStyle === 'space'
          ? false
          : undefined,
      tabWidth: indentSize,
      endOfLine
    }),
    enhanceVscodeSettings({'editor.formatOnSave': formatOnSave})
  ]);
}
