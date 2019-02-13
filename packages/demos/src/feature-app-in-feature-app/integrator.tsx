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
    react: '16.7.0',
    '@feature-hub/react': '0.12.0'
  }
});

const {FeatureHubContextProvider, FeatureAppLoader} = FeatureHubReact;

ReactDOM.render(
  <FeatureHubContextProvider value={{featureAppManager}}>
    <FeatureAppLoader src="feature-app.umd.js" />
  </FeatureHubContextProvider>,

  document.querySelector('main')
);
