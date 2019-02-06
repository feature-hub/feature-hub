import {
  AsyncSsrManagerV0,
  asyncSsrManagerDefinition
} from '@feature-hub/async-ssr-manager';
import {
  ExternalsValidator,
  FeatureAppManager,
  FeatureServiceRegistry
} from '@feature-hub/core';
import {loadCommonJsModule} from '@feature-hub/module-loader-commonjs';
import {
  FeatureHubContextProvider,
  FeatureHubContextValue
} from '@feature-hub/react';
import {
  SerializedStateManagerV0,
  serializedStateManagerDefinition
} from '@feature-hub/serialized-state-manager';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
import {AppRendererOptions, AppRendererResult} from '../start-server';
import {App} from './app';

export default async function renderApp({
  port
}: AppRendererOptions): Promise<AppRendererResult> {
  const integratorDefinition = {
    id: 'test:integrator',
    dependencies: {
      featureServices: {
        [asyncSsrManagerDefinition.id]: '^0.1.0',
        [serializedStateManagerDefinition.id]: '^0.1.0'
      }
    }
  };

  const externalsValidator = new ExternalsValidator({
    react: '16.7.0'
  });

  const featureServiceRegistry = new FeatureServiceRegistry(externalsValidator);

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
    moduleLoader: loadCommonJsModule,
    externalsValidator
  });

  const urlsForHydration = new Set<string>();

  const featureHubContextValue: FeatureHubContextValue = {
    featureAppManager,
    asyncSsrManager,

    addUrlForHydration(url: string): void {
      urlsForHydration.add(url);
    }
  };

  const html = await asyncSsrManager.renderUntilCompleted(() =>
    ReactDOM.renderToString(
      <FeatureHubContextProvider value={featureHubContextValue}>
        <App port={port} />
      </FeatureHubContextProvider>
    )
  );

  const serializedStateManager = featureServices[
    serializedStateManagerDefinition.id
  ] as SerializedStateManagerV0;

  const serializedStates = serializedStateManager.serializeStates();

  return {html, serializedStates, urlsForHydration};
}
