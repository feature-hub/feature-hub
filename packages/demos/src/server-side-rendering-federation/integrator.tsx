import {createFeatureHub} from '@feature-hub/core';
import {defineExternals} from '@feature-hub/module-loader-amd';
import {FeatureHubContextProvider} from '@feature-hub/react';
import {
  SerializedStateManagerV1,
  serializedStateManagerDefinition,
} from '@feature-hub/serialized-state-manager';
import {
  loadFederationModuleFactory,
  WebpackInitSharing,
  WebpackShareScopes,
} from '@feature-hub/module-loader-federation';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {App} from './app';

function getSerializedStatesFromDom(): string | undefined {
  const scriptElement = document.querySelector(
    'script[type="x-feature-hub/serialized-states"]'
  );

  return (scriptElement && scriptElement.textContent) || undefined;
}

function getUrlsForHydrationFromDom(): string[] {
  const scriptElement = document.querySelector(
    'script[type="x-feature-hub/urls-for-hydration"]'
  );

  if (!scriptElement || !scriptElement.textContent) {
    return [];
  }

  return JSON.parse(scriptElement.textContent);
}

declare const __webpack_init_sharing__: WebpackInitSharing;
declare const __webpack_share_scopes__: WebpackShareScopes;

const moduleLoader = loadFederationModuleFactory(
  __webpack_init_sharing__,
  __webpack_share_scopes__
);

(async () => {
  defineExternals({react: React});

  const {featureAppManager, featureServices} = createFeatureHub(
    'test:integrator',
    {
      moduleLoader,
      providedExternals: {},
      featureServiceDefinitions: [serializedStateManagerDefinition],
      featureServiceDependencies: {
        [serializedStateManagerDefinition.id]: '^1.0.0',
      },
    }
  );

  const serializedStateManager = featureServices[
    serializedStateManagerDefinition.id
  ] as SerializedStateManagerV1;

  const serializedStates = getSerializedStatesFromDom();

  if (serializedStates) {
    serializedStateManager.setSerializedStates(serializedStates);
  }

  await Promise.all(
    getUrlsForHydrationFromDom().map(async (url) =>
      featureAppManager.preloadFeatureApp(url)
    )
  );

  ReactDOM.hydrate(
    <FeatureHubContextProvider value={{featureAppManager}}>
      <App />
    </FeatureHubContextProvider>,
    document.querySelector('main')
  );
})().catch(console.error);
