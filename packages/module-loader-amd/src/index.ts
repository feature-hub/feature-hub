// tslint:disable:ordered-imports
import 'systemjs/dist/s.js';
import 'systemjs/dist/extras/named-register.js';
import 'systemjs/dist/extras/amd.js';
// tslint:enable:ordered-imports

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
    System.register(externalName, [], (exportFn) => {
      exportFn(externals[externalName] as System.Module);

      return {};
    });
  }
}

/**
 * @param url A URL pointing to a bundle that was built as an AMD or UMD module.
 *
 * @returns A promise that resolves with the loaded module, or is rejected if
 * the module can not be loaded.
 */
export async function loadAmdModule(url: string): Promise<unknown> {
  const module = await System.import(normalizeUrlForSystemJs(url));

  // After being imported by SystemJS, some AMD bundles (dependent on the
  // bundler that was used) have a `default` property that is also the module
  // (which itself has the actual default export, i.e.
  // `module.default.default`). Luckily, SystemJS uses `Symbol.toStringTag` to
  // tag modules, so we can identify and handle this scenario.
  return Object.prototype.toString.call(module.default) === '[object Module]'
    ? module.default
    : module;
}

function normalizeUrlForSystemJs(url: string): string {
  if (/^https?:\/\//.test(url) || /^\.?\//.test(url)) {
    return url;
  }

  return `./${url}`;
}
