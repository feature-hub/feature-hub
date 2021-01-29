import {ModuleLoader} from '@feature-hub/core';

let __webpack_init_sharing__: any;
let __webpack_share_scopes__: any;

function loadComponent(scope: string, module: string) {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    await __webpack_init_sharing__('default');
    const container = (window as any)[scope]; // or get the container somewhere else
    // Initialize the container, it may provide shared modules
    await container.init(__webpack_share_scopes__.default);
    const factory = await (window as any)[scope].get(module);
    const Module = factory();
    return Module;
  };
}

let moduleCount = 0;

export const loadFederationModule: ModuleLoader = async (
  url: string,
  scope?: string
): Promise<unknown> => {
  if (!scope) {
    scope = 'scope_' + moduleCount++;
  }
  return new Promise(
    (resolve: (value: unknown) => void, reject: (e: any) => void) => {
      const element = document.createElement('script');

      element.src = url;
      element.type = 'text/javascript';
      element.async = true;

      element.onload = () => {
        console.log(`Dynamic Script Loaded: ${url}`);
        loadComponent(scope || '', './FeatureApp')()
          .then(e => resolve(e))
          .catch(e => reject(e));
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
    }
  );
};
