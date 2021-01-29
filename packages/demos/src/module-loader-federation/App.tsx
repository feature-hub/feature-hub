import {createFeatureHub} from '@feature-hub/core';
import {loadFederationModule} from './xx';
import {FeatureAppLoader, FeatureHubContextProvider} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';

const {featureAppManager} = createFeatureHub('test:integrator', {
  moduleLoader: loadFederationModule,
  providedExternals: {},
});

ReactDOM.render(
  <FeatureHubContextProvider value={{featureAppManager}}>
    <FeatureAppLoader
      featureAppId="test:hello-world"
      src="feature-app.umd.js"
    />
  </FeatureHubContextProvider>,

  document.querySelector('main')
);
