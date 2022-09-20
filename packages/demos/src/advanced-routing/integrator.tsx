import {createFeatureHub} from '@feature-hub/core';
import {
  createRootLocationTransformer,
  defineHistoryService,
} from '@feature-hub/history-service';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import {FeatureHubContextProvider} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {unstable_HistoryRouter as HistoryRouter} from 'react-router-dom';
import '../blueprint-css';
import {App} from './app';
import {helloWorldServiceDefinition} from './hello-world-service';
import {
  NavigationServiceV1,
  navigationServiceDefinition,
} from './navigation-service';

defineExternals({react: React});

const {featureAppManager, featureServices} = createFeatureHub(
  'test:integrator',
  {
    moduleLoader: loadAmdModule,
    providedExternals: {react: process.env.REACT_VERSION as string},
    featureServiceDefinitions: [
      defineHistoryService(
        createRootLocationTransformer({consumerPathsQueryParamName: '---'})
      ),
      navigationServiceDefinition,
      helloWorldServiceDefinition,
    ],
    featureServiceDependencies: {
      [navigationServiceDefinition.id]: '^1.0.0',
    },
  }
);

const navigationService = featureServices[
  navigationServiceDefinition.id
] as NavigationServiceV1;

ReactDOM.render(
  <FeatureHubContextProvider value={{featureAppManager}}>
    <HistoryRouter history={navigationService.history}>
      <App />
    </HistoryRouter>
  </FeatureHubContextProvider>,

  document.querySelector('main')
);
