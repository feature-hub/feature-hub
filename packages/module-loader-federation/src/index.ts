interface GlobalScope {
  get: (module: string) => Promise<() => unknown>;
  init: (sharedModules: SharedModules) => Promise<void>;
}

declare global {
  interface Window {
    __feature_hub_feature_app_module_container__: GlobalScope | undefined;
  }
}

// Will be replaced by Webpack with a custom property of __webpack_require__.
declare const __webpack_init_sharing__: (name: string) => Promise<void>;

// Will be replaced by Webpack with a custom property of __webpack_require__.
declare const __webpack_share_scopes__: {
  default: SharedModules;
};

type SharedModules = unknown;

async function loadComponent(): Promise<unknown> {
  // Initializing the default share scope is needed, in case the integrator has
  // not declared any shared modules. If it has declared a shared module,
  // __webpack_init_sharing__ will return early without executing any side
  // effects.
  await __webpack_init_sharing__('default');

  const container = window.__feature_hub_feature_app_module_container__;

  if (!container) {
    throw new Error(
      `The name in the ModuleFederationPlugin must be "__feature_hub_feature_app_module_container__".`
    );
  }

  window.__feature_hub_feature_app_module_container__ = undefined;

  await container.init(__webpack_share_scopes__.default);

  // The container.get call will be rejected when the module can not be found in
  // the module map of the container.
  const factory = await container.get('featureAppModule');
  const Module = factory();

  return Module;
}

/**
 * @param url A URL pointing to a bundle that was built as a federated module.
 *
 * @returns A promise that resolves with the loaded module, or is rejected if
 * the module can not be loaded.
 */
export async function loadFederatedModule(url: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const element = document.createElement('script');

    element.src = url;
    element.type = 'text/javascript';
    element.async = true;

    element.onload = () => {
      loadComponent().then(resolve).catch(reject);
      document.head.removeChild(element);
    };

    element.onerror = () => {
      reject(new Error('Could not load federated module.'));
      document.head.removeChild(element);
    };

    document.head.appendChild(element);
  });
}
