import {
  AsyncSsrManagerV0,
  defineAsyncSsrManager
} from '@feature-hub/async-ssr-manager';
import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {loadCommonJsModule} from '@feature-hub/module-loader-commonjs';
import {FeatureAppLoader} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';

export default async function renderMainHtml(port: number): Promise<string> {
  const integratorDefinition = {
    id: 'demos:integrator',
    dependencies: {
      's2:async-ssr-manager': '^0.1'
    }
  };

  const featureServiceRegistry = new FeatureServiceRegistry();

  featureServiceRegistry.registerFeatureServices(
    [defineAsyncSsrManager(undefined)],
    integratorDefinition.id
  );

  const {featureServices} = featureServiceRegistry.bindFeatureServices(
    integratorDefinition
  );

  const asyncSsrManager = featureServices[
    's2:async-ssr-manager'
  ] as AsyncSsrManagerV0;

  const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
    moduleLoader: loadCommonJsModule
  });

  return asyncSsrManager.renderUntilCompleted(() =>
    ReactDOM.renderToString(
      <FeatureAppLoader
        asyncSsrManager={asyncSsrManager}
        featureAppManager={featureAppManager}
        src=""
        serverSrc={`http://localhost:${port}/feature-app.commonjs.js`}
      />
    )
  );
}
