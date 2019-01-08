import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {defineHistoryService} from '@feature-hub/history-service';
import {FeatureAppContainer} from '@feature-hub/react';
import {defineServerRenderer} from '@feature-hub/server-renderer';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';
import {historyConsumerDefinition} from './history-consumer-definition';
import {rootLocationTransformer} from './root-location-transformer';

// TODO: Remove server renderer config when optional dependencies have landed:
// https://github.com/sinnerschrader/feature-hub/issues/24
const configs = {'s2:server-renderer': {timeout: 0}};
const registry = new FeatureServiceRegistry({configs});

registry.registerFeatureServices(
  [
    defineServerRenderer(undefined),
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
