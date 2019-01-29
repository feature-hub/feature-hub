import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import {FeatureAppLoader, FeatureHubContextProvider} from '@feature-hub/react';
import {
  SerializedStateManagerV0,
  serializedStateManagerDefinition
} from '@feature-hub/serialized-state-manager';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';

const featureAppUrl = 'feature-app.umd.js';

function getSerializedStatesFromDom(): string | undefined {
  const scriptElement = document.querySelector(
    'script[type="x-feature-hub/serialized-states"]'
  );

  return (scriptElement && scriptElement.textContent) || undefined;
}

(async () => {
  const integratorDefinition = {
    id: 'test:integrator',
    dependencies: {
      [serializedStateManagerDefinition.id]: '^0.1'
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

  await featureAppManager.preloadFeatureApp(featureAppUrl);

  const serializedStateManager = featureServices[
    serializedStateManagerDefinition.id
  ] as SerializedStateManagerV0;

  const serializedStates = getSerializedStatesFromDom();

  if (serializedStates) {
    serializedStateManager.setSerializedStates(serializedStates);
  }

  ReactDOM.hydrate(
    <FeatureHubContextProvider value={{featureAppManager}}>
      <FeatureAppLoader src={featureAppUrl} />
    </FeatureHubContextProvider>,
    document.querySelector('main')
  );
})().catch(console.error);
