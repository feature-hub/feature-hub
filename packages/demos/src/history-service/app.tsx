import {FeatureAppManager} from '@feature-hub/core';
import {FeatureAppContainer} from '@feature-hub/react';
import * as React from 'react';
import {historyConsumerDefinition} from './history-consumer-definition';

export interface AppProps {
  featureAppManager: FeatureAppManager;
}

export function App({featureAppManager}: AppProps): JSX.Element {
  return (
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
    </>
  );
}
