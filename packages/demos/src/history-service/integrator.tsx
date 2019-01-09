import {defineAsyncSsrManager} from '@feature-hub/async-ssr-manager';
import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {defineHistoryService} from '@feature-hub/history-service';
import {FeatureAppContainer} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';
import {historyConsumerDefinition} from './history-consumer-definition';
import {rootLocationTransformer} from './root-location-transformer';

const registry = new FeatureServiceRegistry();

registry.registerFeatureServices(
  [
    defineAsyncSsrManager(undefined),
    defineHistoryService(rootLocationTransformer)
  ],
  'demo:integrator'
);

const manager = new FeatureAppManager(registry);

ReactDOM.render(
  <>
    <FeatureAppContainer
      manager={manager}
      featureAppDefinition={historyConsumerDefinition}
      idSpecifier="a"
    />
    <FeatureAppContainer
      manager={manager}
      featureAppDefinition={historyConsumerDefinition}
      idSpecifier="b"
    />
  </>,
  document.querySelector('main')
);
