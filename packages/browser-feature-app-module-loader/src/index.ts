// tslint:disable-next-line:no-import-side-effect
import 'systemjs/dist/system-production';

import {FeatureAppModuleLoader} from '@feature-hub/core';

export interface Externals {
  [moduleName: string]: unknown;
}

export function defineExternals(externals: Externals): void {
  for (const moduleName of Object.keys(externals)) {
    const external = externals[moduleName];

    SystemJS.amdDefine(moduleName, () => external);
  }
}

export const loadFeatureAppModule: FeatureAppModuleLoader = async (
  featureAppUrl: string
) => SystemJS.import(featureAppUrl);
