import {createFeatureHub} from '@feature-hub/core';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import {FeatureAppLoader, FeatureHubContextProvider} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {todoManagerDefinition} from './todo-manager';

const {featureAppManager} = createFeatureHub('test:todomvc-integrator', {
  featureServiceDefinitions: [todoManagerDefinition],
  moduleLoader: loadAmdModule
});

defineExternals({react: React});

document.head.appendChild(
  Object.assign(document.createElement('link'), {
    rel: 'stylesheet',
    href: 'index.css'
  })
);

ReactDOM.render(
  <FeatureHubContextProvider value={{featureAppManager}}>
    <section className="todoapp">
      <FeatureAppLoader
        src="header/feature-app-header.umd.js"
        css={[{href: 'header/index.css'}]}
      />
      <FeatureAppLoader src="main/feature-app-main.umd.js" />
      <FeatureAppLoader src="footer/feature-app-footer.umd.js" />
    </section>
  </FeatureHubContextProvider>,
  document.querySelector('main')
);
