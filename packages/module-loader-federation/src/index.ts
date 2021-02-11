function loadComponent(
  options: FederationOptions,
  webpackInitSharing: WebpackInitSharing,
  webpackShareScopes: WebpackShareScopes
): () => Promise<unknown> {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    await webpackInitSharing('default');
    const container = window[options.globalScopeName]; // or get the container somewhere else
    if (!container) {
      throw new Error(
        'cannot find container for scope ' + options.globalScopeName
      );
    }
    window[options.globalScopeName] = undefined;
    // Initialize the container, it may provide shared modules
    await container.init(webpackShareScopes.default);
    const factory = await container.get(options.featureAppDefinitionImportName);
    const Module = factory();

    return Module;
  };
}

declare var window: {
  [key: string]: GlobalScope | undefined;
};

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
  globalScopeName: string;
  featureAppDefinitionImportName: string;
}

export const loadFederationModuleFactory = (
  webpackInitSharing: WebpackInitSharing,
  webpackShareScopes: WebpackShareScopes,
  options: FederationOptions = {
    featureAppDefinitionImportName: './featureAppDefinition',
    globalScopeName: 'featureHubGlobal',
  }
) => async (url: string) =>
  new Promise((resolve, reject) => {
    const element = document.createElement('script');

    element.src = url;
    element.type = 'text/javascript';
    element.async = true;

    element.onload = () => {
      console.log(`Dynamic Script Loaded: ${url}`);
      loadComponent(options, webpackInitSharing, webpackShareScopes)()
        .then(resolve)
        .catch(reject);
    };

    element.onerror = () => {
      console.error(`Dynamic Script Error: ${url}`);
      reject(`Dynamic Script Error: ${url}`);
    };

    document.head.appendChild(element);

    return () => {
      console.log(`Dynamic Script Removed: ${url}`);
      document.head.removeChild(element);
    };
  });
