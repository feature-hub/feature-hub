import {ModuleLoader} from '@feature-hub/core';
import 'systemjs/dist/system-production';

export interface Externals {
  readonly [moduleName: string]: unknown;
}

/**
 * ```js
 * import {defineExternals} from '@feature-hub/module-loader';
 * ```
 */
export function defineExternals(externals: Externals): void {
  for (const moduleName of Object.keys(externals)) {
    const external = externals[moduleName];

    SystemJS.amdDefine(moduleName, () => external);
  }
}

/**
 * ```js
 * import {loadAmdModule} from '@feature-hub/module-loader';
 * ```
 */
export const loadAmdModule: ModuleLoader = async (
  url: string
): Promise<unknown> => SystemJS.import(url);
