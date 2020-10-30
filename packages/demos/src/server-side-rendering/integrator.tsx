import {createFeatureHub} from '@feature-hub/core';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import {FeatureHubContextProvider} from '@feature-hub/react';
import {
  SerializedStateManagerV1,
  serializedStateManagerDefinition,
} from '@feature-hub/serialized-state-manager';
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

(async () => {
  defineExternals({react: React});

  const {featureAppManager, featureServices} = createFeatureHub(
    'test:integrator',
    {
      moduleLoader: loadAmdModule,
      providedExternals: {react: process.env.REACT_VERSION as string},
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
