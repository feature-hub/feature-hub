import {createFeatureHub} from '@feature-hub/core';
import {loadFederatedModule} from '@feature-hub/module-loader-federation';
import {FeatureAppLoader, FeatureHubContextProvider} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';

const {featureAppManager} = createFeatureHub('test:integrator', {
  moduleLoader: loadFederatedModule,
});

ReactDOM.render(
  <FeatureHubContextProvider value={{featureAppManager}}>
    <FeatureAppLoader
      featureAppId="test:hello-world-1"
      src="feature-app-1.federated.js"
    />
    <FeatureAppLoader
      featureAppId="test:hello-world-2"
      src="feature-app-2.federated.js"
    />
  </FeatureHubContextProvider>,

  document.querySelector('main'),
);
