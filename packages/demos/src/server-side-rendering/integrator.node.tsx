import {
  AsyncSsrManagerV1,
  defineAsyncSsrManager,
} from '@feature-hub/async-ssr-manager';
import {createFeatureHub} from '@feature-hub/core';
import {createCommonJsModuleLoader} from '@feature-hub/module-loader-commonjs';
import {
  Css,
  FeatureHubContextProvider,
  FeatureHubContextProviderValue,
} from '@feature-hub/react';
import {
  SerializedStateManagerV1,
  serializedStateManagerDefinition,
} from '@feature-hub/serialized-state-manager';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
import {
  AppRendererOptions,
  AppRendererResult,
  FeatureAppModuleSource,
} from '../app-renderer';
import {App} from './app';

export default async function renderApp({
  port,
}: AppRendererOptions): Promise<AppRendererResult> {
  const asyncSsrManagerDefinition = defineAsyncSsrManager();

  const {featureAppManager, featureServices} = createFeatureHub(
    'test:integrator',
    {
      moduleLoader: createCommonJsModuleLoader({react: React}),
      providedExternals: {react: process.env.REACT_VERSION as string},
      featureServiceDefinitions: [
        asyncSsrManagerDefinition,
        serializedStateManagerDefinition,
      ],
      featureServiceDependencies: {
        [asyncSsrManagerDefinition.id]: '^1.0.0',
        [serializedStateManagerDefinition.id]: '^1.0.0',
      },
    }
  );

  const asyncSsrManager = featureServices[
    asyncSsrManagerDefinition.id
  ] as AsyncSsrManagerV1;

  const hydrationSources = new Map<string, FeatureAppModuleSource>();
  const stylesheetsForSsr = new Map<string, Css>();

  const featureHubContextValue: FeatureHubContextProviderValue = {
    featureAppManager,
    asyncSsrManager,

    addUrlForHydration: (url, moduleType) =>
      hydrationSources.set(url + moduleType, {url, moduleType}),

    addStylesheetsForSsr: (stylesheets) => {
      for (const stylesheet of stylesheets) {
        stylesheetsForSsr.set(stylesheet.href, stylesheet);
      }
    },
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

  return {html, serializedStates, stylesheetsForSsr, hydrationSources};
}
