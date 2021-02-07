import {createFeatureHub} from '@feature-hub/core';
import {defineLogger} from '@feature-hub/logger';
import {loadCommonJsModule} from '@feature-hub/module-loader-commonjs';
import {FeatureHubContextProvider} from '@feature-hub/react';
import pino from 'pino';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
import {AppRendererOptions, AppRendererResult} from '../app-renderer';
import {App} from './app';

export default async function renderApp({
  req,
}: AppRendererOptions): Promise<AppRendererResult> {
  const logger = pino({prettyPrint: {translateTime: true}, level: 'trace'});

  const {featureAppManager} = createFeatureHub('test:integrator', {
    logger,
    moduleLoader: loadCommonJsModule,
    providedExternals: {react: process.env.REACT_VERSION as string},
    featureServiceDefinitions: [
      defineLogger((consumerId, consumerName) =>
        logger.child({consumerId, consumerName})
      ),
    ],
  });

  const useConsumerName = Boolean(req.query.consumerName);

  const html = ReactDOM.renderToString(
    <FeatureHubContextProvider value={{featureAppManager, logger}}>
      <App useConsumerName={useConsumerName} />
    </FeatureHubContextProvider>
  );

  return {html};
}
