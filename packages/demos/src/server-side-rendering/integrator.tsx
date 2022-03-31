import {createFeatureHub} from '@feature-hub/core';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import {loadFederatedModule} from '@feature-hub/module-loader-federation';
import {FeatureHubContextProvider} from '@feature-hub/react';
import {defineSerializedStateManager} from '@feature-hub/serialized-state-manager';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {FeatureAppModuleSource} from '../app-renderer';
import {App} from './app';

function getSerializedStatesFromDom(): string | undefined {
  const scriptElement = document.querySelector(
    'script[type="x-feature-hub/serialized-states"]'
  );

  return (scriptElement && scriptElement.textContent) || undefined;
}

function getUrlsForHydrationFromDom(): FeatureAppModuleSource[] {
  const scriptElement = document.querySelector(
    'script[type="x-feature-hub/urls-for-hydration"]'
  );

  if (!scriptElement || !scriptElement.textContent) {
    return [];
  }

  return JSON.parse(scriptElement.textContent);
}

(async () => {
  defineExternals({react: React});

  const serializedStates = getSerializedStatesFromDom();

  const {featureAppManager} = createFeatureHub('test:integrator', {
    moduleLoader: async (url, moduleType) =>
      moduleType === 'federated'
        ? loadFederatedModule(url)
        : loadAmdModule(url),
    providedExternals: {react: process.env.REACT_VERSION as string},
    featureServiceDefinitions: [defineSerializedStateManager(serializedStates)],
  });

  await Promise.all(
    getUrlsForHydrationFromDom().map(async ({url, moduleType}) =>
      featureAppManager.preloadFeatureApp(url, moduleType)
    )
  );

  ReactDOM.hydrate(
    <FeatureHubContextProvider value={{featureAppManager}}>
      <App />
    </FeatureHubContextProvider>,
    document.querySelector('main')
  );
})().catch(console.error);
