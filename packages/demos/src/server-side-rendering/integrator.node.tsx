import {
  AsyncSsrManagerV1,
  asyncSsrManagerDefinition
} from '@feature-hub/async-ssr-manager';
import {createFeatureHub} from '@feature-hub/core';
import {loadCommonJsModule} from '@feature-hub/module-loader-commonjs';
import {
  FeatureHubContextProvider,
  FeatureHubContextValue
} from '@feature-hub/react';
import {
  SerializedStateManagerV1,
  serializedStateManagerDefinition
} from '@feature-hub/serialized-state-manager';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
import {getPkgVersion} from '../get-pkg-version';
import {AppRendererOptions, AppRendererResult} from '../start-server';
import {App} from './app';

export default async function renderApp({
  port
}: AppRendererOptions): Promise<AppRendererResult> {
  const {featureAppManager, featureServices} = createFeatureHub(
    'test:integrator',
    {
      moduleLoader: loadCommonJsModule,
      providedExternals: {
        react: getPkgVersion('react'),
        '@feature-hub/react': getPkgVersion('@feature-hub/react')
      },
      featureServiceDefinitions: [
        asyncSsrManagerDefinition,
        serializedStateManagerDefinition
      ],
      featureServiceDependencies: {
        [asyncSsrManagerDefinition.id]: '^1.0.0',
        [serializedStateManagerDefinition.id]: '^1.0.0'
      }
    }
  );

  const asyncSsrManager = featureServices[
    asyncSsrManagerDefinition.id
  ] as AsyncSsrManagerV1;

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
  ] as SerializedStateManagerV1;

  const serializedStates = serializedStateManager.serializeStates();

  return {html, serializedStates, urlsForHydration};
}
