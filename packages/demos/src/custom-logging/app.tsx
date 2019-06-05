import {FeatureServices} from '@feature-hub/core';
import {FeatureAppContainer} from '@feature-hub/react';
import * as React from 'react';
import featureAppDefinition from './feature-app';

export interface AppProps {
  readonly beforeCreate?: (
    featureAppUid: string,
    featureServices: FeatureServices
  ) => void;
}

export function App({beforeCreate}: AppProps): JSX.Element {
  return (
    <>
      <FeatureAppContainer
        featureAppDefinition={featureAppDefinition}
        idSpecifier="first"
        beforeCreate={beforeCreate}
      />
      <FeatureAppContainer
        featureAppDefinition={featureAppDefinition}
        idSpecifier="second"
        beforeCreate={beforeCreate}
      />
    </>
  );
}
