import {
  ExternalsValidator,
  FeatureAppManager,
  FeatureServiceRegistry
} from '@feature-hub/core';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import {FeatureAppLoader, FeatureHubContextProvider} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';

defineExternals({react: React});

const externalsValidator = new ExternalsValidator({
  react: '16.7.0'
});

const featureServiceRegistry = new FeatureServiceRegistry(externalsValidator);

const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
  moduleLoader: loadAmdModule,
  externalsValidator
});

ReactDOM.render(
  <FeatureHubContextProvider value={{featureAppManager}}>
    <FeatureAppLoader src="feature-app.umd.js" />
  </FeatureHubContextProvider>,

  document.querySelector('main')
);
