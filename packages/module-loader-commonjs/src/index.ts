import fetch, {RequestInit} from 'node-fetch';

export interface Externals {
  readonly [externalName: string]: unknown;
}

/**
 * @param externals An object with shared npm dependencies that the integrator
 * wants to provide to Feature Apps. The keys are the names of the dependencies
 * that are used in import/require statements. The values are the modules.
 *
 * @param requestInit An object containing any custom settings that should be
 * applied to the request when fetching a module with node-fetch.
 *
 * @returns A function that accepts a URL pointing to a bundle that was built as
 * a CommonJS module, and that returns a promise that resolves with the loaded
 * module, or is rejected if the module can not be loaded.
 */
export function createCommonJsModuleLoader(
  externals: Externals = {},
  requestInit?: RequestInit
): (url: string) => Promise<unknown> {
  return async (url: string): Promise<unknown> => {
    const response = await fetch(url, requestInit);
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

/**
 * @param url A URL pointing to a bundle that was built as a CommonJS module.
 *
 * @returns A promise that resolves with the loaded module, or is rejected if
 * the module can not be loaded.
 */
export const loadCommonJsModule: (
  url: string
) => Promise<unknown> = createCommonJsModuleLoader();
