import {createFeatureHub} from '@feature-hub/core';
import {ConsumerLoggerCreator, Logger, defineLogger} from '@feature-hub/logger';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import {FeatureHubContextProvider} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import '../blueprint-css';
import {App} from './app';

defineExternals({react: React});

const createConsumerConsole: ConsumerLoggerCreator = consumerId => {
  const prefixArgs = [`%c${consumerId}`, 'font-weight: bold'];

  return {
    trace: console.trace.bind(console, ...prefixArgs),
    debug: console.debug.bind(console, ...prefixArgs),
    info: console.info.bind(console, ...prefixArgs),
    warn: console.warn.bind(console, ...prefixArgs),
    error: console.error.bind(console, ...prefixArgs)
  };
};

const {featureAppManager, featureServices} = createFeatureHub(
  'test:integrator',
  {
    moduleLoader: loadAmdModule,
    providedExternals: {react: process.env.REACT_VERSION as string},
    featureServiceDefinitions: [defineLogger(createConsumerConsole)],
    featureServiceDependencies: {'s2:logger': '^1.0.0'}
  }
);

const logger = featureServices['s2:logger'] as Logger;

ReactDOM.hydrate(
  <FeatureHubContextProvider value={{featureAppManager}}>
    <App
      beforeCreate={featureAppUid =>
        logger.debug(`Creating Feature App "${featureAppUid}"...`)
      }
    />
  </FeatureHubContextProvider>,
  document.querySelector('main')
);
