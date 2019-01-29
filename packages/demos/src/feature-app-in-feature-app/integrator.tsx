import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {
  FeatureAppContainer,
  FeatureHubContextProvider
} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';
import featureAppDefinition from './feature-app-outer';

const featureServiceRegistry = new FeatureServiceRegistry();

const featureAppManager = new FeatureAppManager(featureServiceRegistry);

ReactDOM.render(
  <FeatureHubContextProvider value={{featureAppManager}}>
    <FeatureAppContainer featureAppDefinition={featureAppDefinition} />
  </FeatureHubContextProvider>,

  document.querySelector('main')
);
