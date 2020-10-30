import {createFeatureHub} from '@feature-hub/core';
import {defineHistoryService} from '@feature-hub/history-service';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';
import {App} from './app';
import {rootLocationTransformer} from './root-location-transformer';

const {featureAppManager} = createFeatureHub('test:integrator', {
  featureServiceDefinitions: [defineHistoryService(rootLocationTransformer)],
});

ReactDOM.render(
  <App featureAppManager={featureAppManager} />,
  document.querySelector('main')
);
