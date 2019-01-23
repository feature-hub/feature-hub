import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {loadCommonJsModule} from '@feature-hub/module-loader-commonjs';
import {FeatureAppLoader} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
import {AppRendererOptions, AppRendererResult} from '../start-server';

export default async function renderApp({
  port
}: AppRendererOptions): Promise<AppRendererResult> {
  const featureAppNodeUrl = `http://localhost:${port}/feature-app.commonjs.js`;
  const featureServiceRegistry = new FeatureServiceRegistry();

  const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
    moduleLoader: loadCommonJsModule
  });

  await featureAppManager.preloadFeatureApp(featureAppNodeUrl);

  const html = ReactDOM.renderToString(
    <FeatureAppLoader
      featureAppManager={featureAppManager}
      src=""
      serverSrc={featureAppNodeUrl}
    />
  );

  return {html};
}
