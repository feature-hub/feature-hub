import {createFeatureHub} from '@feature-hub/core';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import * as FeatureHubReact from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';

defineExternals({
  react: React,
  '@feature-hub/react': FeatureHubReact
});

const {featureAppManager} = createFeatureHub('test:integrator', {
  moduleLoader: loadAmdModule,
  providedExternals: {
    react: process.env.REACT_VERSION as string,
    '@feature-hub/react': process.env.FEATURE_HUB_REACT_VERSION as string
  }
});

const {FeatureHubContextProvider, FeatureAppLoader} = FeatureHubReact;

ReactDOM.render(
  <FeatureHubContextProvider value={{featureAppManager}}>
    <FeatureAppLoader src="feature-app.umd.js" />
  </FeatureHubContextProvider>,

  document.querySelector('main')
);
