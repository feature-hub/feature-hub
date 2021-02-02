function loadComponent(
  scope: string,
  module: string,
  webpackInitSharing: any,
  webpackShareScopes: any
) {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    await webpackInitSharing('default');
    const container = (window as any)[scope]; // or get the container somewhere else
    if (!container) {
      throw new Error('cannot find container for scope ' + scope);
    }
    // Initialize the container, it may provide shared modules
    await container.init(webpackShareScopes.default);
    const factory = await (window as any)[scope].get(module);
    const Module = factory();
    return Module;
  };
}

export type WebpackInitSharing = () => any;
export type WebpackShareScopes = {[scope: string]: {get: () => any}};

export const loadFederationModuleFactory = (
  webpackInitSharing: WebpackInitSharing,
  webpackShareScopes: any
) => async (url: string, scope?: string) => {
  if (!scope) {
    const name = url.match(/(https?:\/\/)?(.*)\.\w+/);
    if (name == null || name.length < 3) {
      throw new Error('cannot extract scope from url: ' + url);
    }
    scope = name[2].split('/').join('_');
  }
  return new Promise((resolve, reject) => {
    const element = document.createElement('script');

    element.src = url;
    element.type = 'text/javascript';
    element.async = true;

    element.onload = () => {
      console.log(`Dynamic Script Loaded: ${url}`);
      loadComponent(
        scope || '',
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
