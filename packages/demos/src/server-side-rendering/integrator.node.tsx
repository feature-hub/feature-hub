import {
  AsyncSsrManagerV0,
  asyncSsrManagerDefinition
} from '@feature-hub/async-ssr-manager';
import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {loadCommonJsModule} from '@feature-hub/module-loader-commonjs';
import {FeatureAppLoader, FeatureHubContextProvider} from '@feature-hub/react';
import {
  SerializedStateManagerV0,
  serializedStateManagerDefinition
} from '@feature-hub/serialized-state-manager';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
import {AppRendererOptions, AppRendererResult} from '../start-server';

export default async function renderApp({
  port
}: AppRendererOptions): Promise<AppRendererResult> {
  const integratorDefinition = {
    id: 'test:integrator',
    dependencies: {
      [asyncSsrManagerDefinition.id]: '^0.1',
      [serializedStateManagerDefinition.id]: '^0.1'
    }
  };

  const featureServiceRegistry = new FeatureServiceRegistry();

  featureServiceRegistry.registerFeatureServices(
    [asyncSsrManagerDefinition, serializedStateManagerDefinition],
    integratorDefinition.id
  );

  const {featureServices} = featureServiceRegistry.bindFeatureServices(
    integratorDefinition
  );

  const asyncSsrManager = featureServices[
    asyncSsrManagerDefinition.id
  ] as AsyncSsrManagerV0;

  const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
    moduleLoader: loadCommonJsModule
  });

  const html = await asyncSsrManager.renderUntilCompleted(() =>
    ReactDOM.renderToString(
      <FeatureHubContextProvider value={{featureAppManager, asyncSsrManager}}>
        <FeatureAppLoader
          src=""
          serverSrc={`http://localhost:${port}/feature-app.commonjs.js`}
        />
      </FeatureHubContextProvider>
    )
  );

  const serializedStateManager = featureServices[
    serializedStateManagerDefinition.id
  ] as SerializedStateManagerV0;

  const serializedStates = serializedStateManager.serializeStates();

  return {html, serializedStates};
}
