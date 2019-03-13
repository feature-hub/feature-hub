import {FeatureAppContainer} from '@feature-hub/react';
import * as React from 'react';
import featureAppDefinition from './feature-app';

export function App(): JSX.Element {
  return (
    <>
      <FeatureAppContainer
        featureAppDefinition={featureAppDefinition}
        idSpecifier="first"
      />
      <FeatureAppContainer
        featureAppDefinition={featureAppDefinition}
        idSpecifier="second"
      />
    </>
  );
}
