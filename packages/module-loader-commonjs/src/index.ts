import {ModuleLoader} from '@feature-hub/core';
import fetch from 'node-fetch';

export interface Externals {
  readonly [externalName: string]: unknown;
}

export function createCommonJsModuleLoader(
  externals: Externals = {}
): ModuleLoader {
  return async (url: string): Promise<unknown> => {
    const response = await fetch(url);
    const source = await response.text();
    const mod = {exports: {}};

    // tslint:disable-next-line:function-constructor
    Function(
      'module',
      'exports',
      'require',
      `${source}
      //# sourceURL=${url}`
    )(mod, mod.exports, (dep: string) =>
      // tslint:disable-next-line:no-eval https://stackoverflow.com/a/41063795/10385541
      externals.hasOwnProperty(dep) ? externals[dep] : eval('require')(dep)
    );

    return mod.exports;
  };
}

export const loadCommonJsModule: ModuleLoader = createCommonJsModuleLoader();
