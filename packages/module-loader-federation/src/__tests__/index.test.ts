import {loadFederationModuleFactory} from '..';

const webpackInitSharing = jest.fn();
const webpackShareScopes = {default: {}};

describe('load featureapp via webpack module federation', () => {
  it('when a module is loaded successfully', async () => {
    const featureAppDefinition = {};
    const loadModule = loadFederationModuleFactory(
      webpackInitSharing,
      webpackShareScopes
    );
    const url = 'featureapp.js';
    const modulePromise = loadModule(url);

    // start simulation of script loading
    const script = document.querySelector('head script');
    // set container to global variable

    // tslint:disable-next-line:no-any
    (window as any).featureHubGlobal = {
      init: jest.fn(),
      get: () => Promise.resolve(() => featureAppDefinition),
    };
    // dispatch load event
    script?.dispatchEvent(new Event('load'));
    // end simulation

    const module = await modulePromise;
    expect(module).toEqual(featureAppDefinition);
  });

  it('when a module cannot be loaded', () => {
    const loadModule = loadFederationModuleFactory(
      webpackInitSharing,
      webpackShareScopes
    );
    const url = 'featureapp.js';
    const modulePromise = loadModule(url);

    // start simulation of script loading
    const script = document.querySelector('head script');
    // dispatch load event
    script?.dispatchEvent(new Event('error'));
    // end simulation

    // tslint:disable-next-line:no-floating-promises
    expect(modulePromise).rejects.toThrow();
  });

  it('when a module cannot be loaded because the global variable is not set', () => {
    const loadModule = loadFederationModuleFactory(
      webpackInitSharing,
      webpackShareScopes
    );
    const url = 'featureapp.js';
    const modulePromise = loadModule(url);

    // start simulation of script loading
    const script = document.querySelector('head script');
    // dispatch load event
    script?.dispatchEvent(new Event('load'));
    // end simulation

    // tslint:disable-next-line:no-floating-promises
    expect(modulePromise).rejects.toThrow();
  });
});
