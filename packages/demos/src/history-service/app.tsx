import {FeatureAppManagerLike} from '@feature-hub/core';
import {
  FeatureAppContainer,
  FeatureHubContextProvider
} from '@feature-hub/react';
import * as React from 'react';
import {historyConsumerDefinition} from './history-consumer-definition';

export interface AppProps {
  featureAppManager: FeatureAppManagerLike;
}

export function App({featureAppManager}: AppProps): JSX.Element {
  return (
    <FeatureHubContextProvider value={{featureAppManager}}>
      <FeatureAppContainer
        featureAppDefinition={historyConsumerDefinition}
        idSpecifier="a"
      />
      <FeatureAppContainer
        featureAppDefinition={historyConsumerDefinition}
        idSpecifier="b"
      />
    </FeatureHubContextProvider>
  );
}
