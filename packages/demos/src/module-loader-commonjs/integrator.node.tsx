import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {loadCommonJsModule} from '@feature-hub/module-loader-commonjs';
import {FeatureAppLoader} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';

export default async function renderMainHtml(port: number): Promise<string> {
  const featureAppNodeUrl = `http://localhost:${port}/feature-app.commonjs.js`;
  const featureServiceRegistry = new FeatureServiceRegistry();

  const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
    moduleLoader: loadCommonJsModule
  });

  await featureAppManager.preloadFeatureApp(featureAppNodeUrl);

  return ReactDOM.renderToString(
    <FeatureAppLoader
      featureAppManager={featureAppManager}
      src=""
      serverSrc={featureAppNodeUrl}
    />
  );
}
