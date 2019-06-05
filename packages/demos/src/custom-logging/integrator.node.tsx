import {createFeatureHub} from '@feature-hub/core';
import {defineLogger} from '@feature-hub/logger';
import {loadCommonJsModule} from '@feature-hub/module-loader-commonjs';
import {FeatureHubContextProvider} from '@feature-hub/react';
import pino from 'pino';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
import {getPkgVersion} from '../get-pkg-version';
import {AppRendererResult} from '../start-server';
import {App} from './app';

export default async function renderApp(): Promise<AppRendererResult> {
  const logger = pino({prettyPrint: {translateTime: true}, level: 'trace'});

  const {featureAppManager} = createFeatureHub('test:integrator', {
    logger,
    moduleLoader: loadCommonJsModule,
    providedExternals: {react: getPkgVersion('react')},
    featureServiceDefinitions: [
      defineLogger(consumerId => logger.child({consumerId}))
    ]
  });

  const html = ReactDOM.renderToString(
    <FeatureHubContextProvider value={{featureAppManager, logger}}>
      <App />
    </FeatureHubContextProvider>
  );

  return {html};
}
