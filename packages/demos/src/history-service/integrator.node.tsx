import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {defineHistoryService} from '@feature-hub/history-service';
import {defineServerRequest} from '@feature-hub/server-request';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
import {AppRendererOptions, AppRendererResult} from '../start-server';
import {App} from './app';
import {rootLocationTransformer} from './root-location-transformer';

export default async function renderApp({
  req
}: AppRendererOptions): Promise<AppRendererResult> {
  const featureServiceRegistry = new FeatureServiceRegistry();

  const featureServiceDefinitions = [
    defineServerRequest(req),
    defineHistoryService(rootLocationTransformer)
  ];

  featureServiceRegistry.registerFeatureServices(
    featureServiceDefinitions,
    'test:integrator'
  );

  const featureAppManager = new FeatureAppManager(featureServiceRegistry);

  const html = ReactDOM.renderToString(
    <App featureAppManager={featureAppManager} />
  );

  return {html};
}
