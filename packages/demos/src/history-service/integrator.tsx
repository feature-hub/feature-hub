import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {defineHistoryService} from '@feature-hub/history-service';
import {FeatureAppContainer} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';
import {historyConsumerDefinition} from './history-consumer-definition';
import {rootLocationTransformer} from './root-location-transformer';

const featureServiceRegistry = new FeatureServiceRegistry();

featureServiceRegistry.registerFeatureServices(
  [defineHistoryService(rootLocationTransformer)],
  'test:integrator'
);

const featureAppManager = new FeatureAppManager(featureServiceRegistry);

ReactDOM.render(
  <>
    <FeatureAppContainer
      featureAppManager={featureAppManager}
      featureAppDefinition={historyConsumerDefinition}
      idSpecifier="a"
    />
    <FeatureAppContainer
      featureAppManager={featureAppManager}
      featureAppDefinition={historyConsumerDefinition}
      idSpecifier="b"
    />
  </>,
  document.querySelector('main')
);
