import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import {FeatureAppLoader} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';

const featureServiceRegistry = new FeatureServiceRegistry();

const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
  moduleLoader: loadAmdModule
});

defineExternals({react: React});

ReactDOM.render(
  <FeatureAppLoader
    featureAppManager={featureAppManager}
    src="feature-app.umd.js"
  />,
  document.querySelector('main')
);
