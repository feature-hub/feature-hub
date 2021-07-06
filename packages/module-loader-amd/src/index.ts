import 'systemjs/dist/system-production';

export interface Externals {
  readonly [externalName: string]: unknown;
}

/**
 * @param externals An object with shared npm dependencies that the integrator
 * wants to provide to Feature Apps. The keys are the names of the dependencies
 * that are used in import/require statements. The values are the modules.
 */
export function defineExternals(externals: Externals): void {
  for (const externalName of Object.keys(externals)) {
    const external = externals[externalName];

    SystemJS.amdDefine(externalName, () => external);
  }
}

/**
 * @param url A URL pointing to a bundle that was built as an AMD or UMD module.
 *
 * @returns A promise that resolves with the loaded module, or is rejected if
 * the module can not be loaded.
 */
export async function loadAmdModule(url: string): Promise<unknown> {
  return SystemJS.import(url);
}
