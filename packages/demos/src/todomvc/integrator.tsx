import {createFeatureHub} from '@feature-hub/core';
import {defineLogger} from '@feature-hub/logger';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import {FeatureAppLoader, FeatureHubContextProvider} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {todoManagerDefinition} from './todo-manager';

const {featureAppManager} = createFeatureHub('test:todomvc-integrator', {
  featureServiceDefinitions: [defineLogger(), todoManagerDefinition],
  moduleLoader: loadAmdModule,
  providedExternals: {
    react: process.env.REACT_VERSION as string,
  },
});

defineExternals({react: React});

document.head.appendChild(
  Object.assign(document.createElement('link'), {
    rel: 'stylesheet',
    href: 'index.css',
  })
);

ReactDOM.render(
  <FeatureHubContextProvider value={{featureAppManager}}>
    <section className="todoapp">
      <FeatureAppLoader
        featureAppId="test:todomvc-header"
        baseUrl="header"
        src="feature-app-header.umd.js"
        css={[{href: 'index.css'}]}
      />
      <FeatureAppLoader
        featureAppId="s2:todomvc-main"
        baseUrl="main"
        src="feature-app-main.umd.js"
      />
      <FeatureAppLoader
        featureAppId="test:todomvc-footer"
        baseUrl="footer"
        src="feature-app-footer.umd.js"
      />
    </section>
  </FeatureHubContextProvider>,
  document.querySelector('main')
);
