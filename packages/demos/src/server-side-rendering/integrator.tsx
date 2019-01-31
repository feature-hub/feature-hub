import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import {FeatureHubContextProvider} from '@feature-hub/react';
import {
  SerializedStateManagerV0,
  serializedStateManagerDefinition
} from '@feature-hub/serialized-state-manager';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';
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
  const integratorDefinition = {
    id: 'test:integrator',
    dependencies: {
      featureServices: {
        [serializedStateManagerDefinition.id]: '^0.1'
      }
    }
  };

  const featureServiceRegistry = new FeatureServiceRegistry();

  featureServiceRegistry.registerFeatureServices(
    [serializedStateManagerDefinition],
    integratorDefinition.id
  );

  const {featureServices} = featureServiceRegistry.bindFeatureServices(
    integratorDefinition
  );

  const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
    moduleLoader: loadAmdModule
  });

  defineExternals({react: React});

  const serializedStateManager = featureServices[
    serializedStateManagerDefinition.id
  ] as SerializedStateManagerV0;

  const serializedStates = getSerializedStatesFromDom();

  if (serializedStates) {
    serializedStateManager.setSerializedStates(serializedStates);
  }

  await Promise.all(
    getUrlsForHydrationFromDom().map(async url =>
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
