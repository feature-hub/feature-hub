import {createFeatureHub} from '@feature-hub/core';
import {loadCommonJsModule} from '@feature-hub/module-loader-commonjs';
import {FeatureAppLoader, FeatureHubContextProvider} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
import {getPkgVersion} from '../get-pkg-version';
import {AppRendererOptions, AppRendererResult} from '../start-server';

export default async function renderApp({
  port,
}: AppRendererOptions): Promise<AppRendererResult> {
  const featureAppNodeUrl = `http://localhost:${port}/feature-app.commonjs.js`;

  const {featureAppManager} = createFeatureHub('test:integrator', {
    moduleLoader: loadCommonJsModule,
    providedExternals: {
      react: getPkgVersion('react'),
      '@feature-hub/react': getPkgVersion('@feature-hub/react'),
    },
  });

  // In a real-world integrator, instead of preloading a Feature App manually
  // before rendering, the Async SSR Manager would be used to handle the
  // asynchronous server-side rendering (see "Server-Side Rendering" demo).
  await featureAppManager.preloadFeatureApp(featureAppNodeUrl);

  const html = ReactDOM.renderToString(
    <FeatureHubContextProvider value={{featureAppManager}}>
      <FeatureAppLoader
        featureAppId="test:hello-world-outer"
        src="feature-app.umd.js"
        serverSrc={featureAppNodeUrl}
      />
    </FeatureHubContextProvider>
  );

  return {html};
}
