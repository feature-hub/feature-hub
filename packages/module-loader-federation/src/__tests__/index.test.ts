import {loadFederatedModule} from '..';

declare global {
  interface Window {
    __webpack_init_sharing__: (name: string) => Promise<void>;
    __webpack_share_scopes__: {default: {}};
  }
}

describe('load featureapp via webpack module federation', () => {
  beforeEach(() => {
    window.__webpack_init_sharing__ = jest.fn();
    window.__webpack_share_scopes__ = {default: {}};
  });

  it('returns the feature app module when the module is loaded successfully', async () => {
    const featureAppModule = {};
    const modulePromise = loadFederatedModule('feature-app.js');
    const script = document.querySelector('head script');

    window.__feature_hub_feature_app_module_container__ = {
      init: jest.fn(),
      get: () => Promise.resolve(() => featureAppModule),
    };

    script?.dispatchEvent(new Event('load'));

    const module = await modulePromise;
    expect(module).toEqual(featureAppModule);
  });

  it('rejects when the module cannot be loaded', async () => {
    const modulePromise = loadFederatedModule('feature-app.js');
    const script = document.querySelector('head script');

    script?.dispatchEvent(new Event('error'));

    return expect(modulePromise).rejects.toThrowError();
  });

  it('rejects when __feature_hub_feature_app_module_container__ is not defined', async () => {
    const url = 'featureapp.js';
    const modulePromise = loadFederatedModule(url);
    const script = document.querySelector('head script');

    script?.dispatchEvent(new Event('load'));

    return expect(modulePromise).rejects.toThrowError();
  });
});
