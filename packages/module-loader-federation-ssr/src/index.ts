import {ModuleLoader} from '@feature-hub/core';
import fetch from 'node-fetch';

async function loadComponent(
  container: any,
  _options: FederationOptions,
  webpackInitSharing: WebpackInitSharing,
  webpackShareScopes: WebpackShareScopes
): Promise<unknown> {
  console.log('container', container);

  console.log('getmodule', container);
  try {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    await webpackInitSharing('default');
    if (!container) {
      throw new Error('cannot find container');
    }
    // Initialize the container, it may provide shared modules
    console.log('container', container);
    await container.init(webpackShareScopes.default);
    const factory = await container.get('./featureAppDefinition'); //options.featureAppDefinitionImportName);
    const Module = factory();
    console.log('Module ', Object.keys(Module));
    return Module;
  } catch (e) {
    console.error('cannot load module', e);
    throw e;
  }
}

type SharedModules = unknown;

export type WebpackInitSharing = (name: string) => Promise<void>;
export interface WebpackShareScopes {
  default: SharedModules;
}
export interface GlobalScope {
  get: (module: string) => Promise<() => unknown>;
  init: (sharedModules: SharedModules) => Promise<void>;
}

export interface FederationOptions {
  featureAppDefinitionImportName: string;
}

export interface Externals {
  readonly [externalName: string]: unknown;
}

export function createModuleFederationSsrModuleLoader(
  webpackInitSharing: WebpackInitSharing,
  webpackShareScopes: WebpackShareScopes
): ModuleLoader {
  console.log('create ssr module loader');
  return async (url: string): Promise<unknown> => {
    try {
      console.log('fetch', url);
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
        eval('require')(dep)
      );
      console.log('+++++++', Object.keys(mod.exports));
      return await loadComponent(
        mod.exports,
        {
          featureAppDefinitionImportName: 'featureAppDefinition',
        },
        webpackInitSharing,
        webpackShareScopes
      );
    } catch (e) {
      console.error('cannot load module', e);
      throw e;
    }
  };
}
