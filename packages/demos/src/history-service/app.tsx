import {FeatureAppManager} from '@feature-hub/core';
import {
  FeatureAppContainer,
  FeatureHubContextProvider,
} from '@feature-hub/react';
import * as React from 'react';
import {historyConsumerDefinition} from './history-consumer';

export interface AppProps {
  featureAppManager: FeatureAppManager;
}

export function App({featureAppManager}: AppProps): JSX.Element {
  return (
    <FeatureHubContextProvider value={{featureAppManager}}>
      <FeatureAppContainer
        featureAppId="test:history-consumer:a"
        featureAppDefinition={historyConsumerDefinition}
      />
      <FeatureAppContainer
        featureAppId="test:history-consumer:b"
        featureAppDefinition={historyConsumerDefinition}
      />
    </FeatureHubContextProvider>
  );
}
