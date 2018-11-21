// tslint:disable-next-line:no-import-side-effect
import 'systemjs/dist/system-production';

export interface Externals {
  [moduleName: string]: unknown;
}

export function defineExternals(externals: Externals): void {
  for (const moduleName of Object.keys(externals)) {
    const external = externals[moduleName];

    SystemJS.amdDefine(moduleName, () => external);
  }
}

export async function loadFeatureAppModule(
  featureAppUrl: string
): Promise<unknown> {
  return SystemJS.import(featureAppUrl);
}
