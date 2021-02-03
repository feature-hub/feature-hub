function loadComponent(
  scope: string,
  module: string,
  webpackInitSharing: WebpackInitSharing,
  webpackShareScopes: WebpackShareScopes
): () => Promise<unknown> {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    await webpackInitSharing('default');
    const container = window[scope]; // or get the container somewhere else
    if (!container) {
      throw new Error('cannot find container for scope ' + scope);
    }
    // Initialize the container, it may provide shared modules
    await container.init(webpackShareScopes.default);
    const factory = await window[scope].get(module);
    const Module = factory();

    return Module;
  };
}

declare var window: {
  [scope: string]: GlobalScope;
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

function getScope(url: string, scope?: string): string {
  if (scope) {
    return scope;
  }
  const name = url.match(/(https?:\/\/)?(.*)\.\w+/);
  if (name == null || name.length < 3) {
    throw new Error('cannot extract scope from url: ' + url);
  }

  return name[2].split('/').join('_');
}

export const loadFederationModuleFactory = (
  webpackInitSharing: WebpackInitSharing,
  webpackShareScopes: WebpackShareScopes
) => async (url: string, scope?: string) => {
  const realScope = getScope(url, scope);

  return new Promise((resolve, reject) => {
    const element = document.createElement('script');

    element.src = url;
    element.type = 'text/javascript';
    element.async = true;

    element.onload = () => {
      console.log(`Dynamic Script Loaded: ${url}`);
      loadComponent(
        realScope,
        './featureAppDefinition',
        webpackInitSharing,
        webpackShareScopes
      )()
        .then((moduleObject) => {
          resolve(moduleObject);
        })
        .catch((e) => reject(e));
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
};
