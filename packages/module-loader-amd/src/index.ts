import {ModuleLoader} from '@feature-hub/core';
import 'systemjs/dist/system-production';

export interface Externals {
  readonly [externalName: string]: unknown;
}

export function defineExternals(externals: Externals): void {
  for (const externalName of Object.keys(externals)) {
    const external = externals[externalName];

    SystemJS.amdDefine(externalName, () => external);
  }
}

export const loadAmdModule: ModuleLoader = async (
  url: string
): Promise<unknown> => SystemJS.import(url);
