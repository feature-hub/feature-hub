import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {
  createRootLocationTransformer,
  defineHistoryService
} from '@feature-hub/history-service';
import {FeatureAppContainer} from '@feature-hub/react';
import {defineServerRenderer} from '@feature-hub/server-renderer';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {historyConsumerDefinition} from './history-consumer';

// tslint:disable
import 'normalize.css/normalize.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/core/lib/css/blueprint.css';
// tslint:enable

const registry = new FeatureServiceRegistry();

registry.registerProviders(
  [
    defineServerRenderer(undefined),
    defineHistoryService(
      createRootLocationTransformer({consumerPathsQueryParamName: 'test'})
    )
  ],
  'integrator'
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
