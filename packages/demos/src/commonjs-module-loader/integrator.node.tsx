import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {loadCommonJsModule} from '@feature-hub/module-loader/lib/cjs/node';
import {FeatureAppLoader} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';

export default async function renderMainHtml(port: number): Promise<string> {
  const featureAppNodeUrl = `http://localhost:${port}/feature-app.commonjs.js`;
  const registry = new FeatureServiceRegistry();

  const manager = new FeatureAppManager(registry, {
    moduleLoader: loadCommonJsModule
  });

  await manager.preloadFeatureApp(featureAppNodeUrl);

  return ReactDOM.renderToString(
    <FeatureAppLoader manager={manager} src="" serverSrc={featureAppNodeUrl} />
  );
}
