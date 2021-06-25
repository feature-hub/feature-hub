import {createFeatureHub} from '@feature-hub/core';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import {loadFederatedModule} from '@feature-hub/module-loader-federation';
import {FeatureAppLoader, FeatureHubContextProvider} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';

defineExternals({react: React});

const {featureAppManager} = createFeatureHub('test:integrator', {
  moduleLoader: async (url, moduleType) =>
    moduleType === 'federated' ? loadFederatedModule(url) : loadAmdModule(url),
});

ReactDOM.render(
  <FeatureHubContextProvider value={{featureAppManager}}>
    <FeatureAppLoader
      featureAppId="test:hello-world-1"
      src="feature-app-1.umd.js"
    />
    <FeatureAppLoader
      featureAppId="test:hello-world-2"
      src="feature-app-2.federated.js"
      moduleType="federated"
    />
  </FeatureHubContextProvider>,

  document.querySelector('main')
);
