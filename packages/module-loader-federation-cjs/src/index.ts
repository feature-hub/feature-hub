import fetch from 'node-fetch';

function loadComponent(
  container: GlobalScope,
  module: string,
  webpackInitSharing: WebpackInitSharing,
  webpackShareScopes: WebpackShareScopes
): () => Promise<unknown> {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    await webpackInitSharing('default');

    // Initialize the container, it may provide shared modules
    await container.init(webpackShareScopes.default);
    const factory = await container.get(module);
    const Module = factory();

    return Module;
  };
}

declare var window: {
  featurehubGlobal: GlobalScope | undefined;
};

async function load(url: string): Promise<GlobalScope> {
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

  return mod.exports as GlobalScope;
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

export const loadFederationModuleSsrFactory = (
  webpackInitSharing: WebpackInitSharing,
  webpackShareScopes: WebpackShareScopes
) => async (url: string) =>
  new Promise(async (resolve, reject) => {
    const container = await load(url);
    console.log(`Dynamic Script Loaded: ${url}`);
    loadComponent(
      container,
      './featureAppDefinition',
      webpackInitSharing,
      webpackShareScopes
    )()
      .then(resolve)
      .catch(reject);
  });
