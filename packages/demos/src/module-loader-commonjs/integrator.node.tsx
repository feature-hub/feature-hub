import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {loadCommonJsModule} from '@feature-hub/module-loader-commonjs';
import {FeatureAppLoader} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';

export default async function renderMainHtml(port: number): Promise<string> {
  // TODO: Remove server renderer config when optional dependencies have landed:
  // https://github.com/sinnerschrader/feature-hub/issues/24
  const configs = {'s2:server-renderer': {timeout: 0}};
  const registry = new FeatureServiceRegistry({configs});
  const featureAppNodeUrl = `http://localhost:${port}/feature-app.commonjs.js`;

  const manager = new FeatureAppManager(registry, {
    moduleLoader: loadCommonJsModule
  });

  await manager.preloadFeatureApp(featureAppNodeUrl);

  return ReactDOM.renderToString(
    <FeatureAppLoader manager={manager} src="" serverSrc={featureAppNodeUrl} />
  );
}
