import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {defineHistoryService} from '@feature-hub/history-service';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';
import {App} from './app';
import {rootLocationTransformer} from './root-location-transformer';

const featureServiceRegistry = new FeatureServiceRegistry();

featureServiceRegistry.registerFeatureServices(
  [defineHistoryService(rootLocationTransformer)],
  'test:integrator'
);

const featureAppManager = new FeatureAppManager(featureServiceRegistry);

ReactDOM.render(
  <App featureAppManager={featureAppManager} />,
  document.querySelector('main')
);
