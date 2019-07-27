import {ModuleLoader} from '@feature-hub/core';
import fetch from 'node-fetch';

export interface Externals {
  readonly [externalName: string]: unknown;
}

export function createCommonJsModuleLoader(
  // The externals param is referenced in the eval call, see below.
  _externals: Externals = {}
): ModuleLoader {
  return async (url: string): Promise<unknown> => {
    const response = await fetch(url);
    const source = await response.text();
    const mod = {exports: {}};

    // tslint:disable-next-line:no-eval
    eval(
      // The source text must start in the first line to retain the original line
      // numbers in error stacks and console traces.
      `(function (module, exports, require) { ${source}
    })(mod, mod.exports, function (dep) {
        return _externals.hasOwnProperty(dep) ? _externals[dep] : require(dep);
      });
    //# sourceURL=${url}`
    );

    return mod.exports;
  };
}

export const loadCommonJsModule: ModuleLoader = createCommonJsModuleLoader();
