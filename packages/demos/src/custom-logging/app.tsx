import {FeatureAppEnvironment, FeatureServices} from '@feature-hub/core';
import {FeatureAppContainer} from '@feature-hub/react';
import * as React from 'react';
import featureAppDefinition from './feature-app';

export interface AppProps {
  readonly beforeCreate?: (
    env: FeatureAppEnvironment<FeatureServices, undefined>
  ) => void;
}

export function App({beforeCreate}: AppProps): JSX.Element {
  return (
    <>
      <FeatureAppContainer
        featureAppDefinition={featureAppDefinition}
        featureAppId="test:logging-app:first"
        beforeCreate={beforeCreate}
      />
      <FeatureAppContainer
        featureAppDefinition={featureAppDefinition}
        featureAppId="test:logging-app:second"
        beforeCreate={beforeCreate}
      />
    </>
  );
}
