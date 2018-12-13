import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {defineHistoryService} from '@feature-hub/history-service';
import {FeatureAppContainer} from '@feature-hub/react';
import {defineServerRenderer} from '@feature-hub/server-renderer';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {historyConsumerDefinition} from './history-consumer';
import {rootLocationTransformer} from './root-location-transformer';

// tslint:disable
import 'normalize.css/normalize.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/core/lib/css/blueprint.css';
// tslint:enable

const registry = new FeatureServiceRegistry();

registry.registerProviders(
  [
    defineServerRenderer(undefined),
    defineHistoryService(rootLocationTransformer)
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
