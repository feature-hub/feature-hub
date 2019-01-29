import {FeatureAppDefinition} from '@feature-hub/core';
import * as React from 'react';
import {FeatureHubContextConsumer} from './feature-hub-context';
import {InternalFeatureAppContainer} from './internal/feature-app-container';

export interface DomFeatureApp {
  attachTo(container: Element): void;
}

export interface ReactFeatureApp {
  render(): React.ReactNode;
}

export type FeatureApp = DomFeatureApp | ReactFeatureApp;

export interface FeatureAppContainerProps {
  readonly featureAppDefinition: FeatureAppDefinition<unknown>;
  readonly idSpecifier?: string;
}

export function FeatureAppContainer(
  props: FeatureAppContainerProps
): JSX.Element {
  return (
    <FeatureHubContextConsumer>
      {({featureAppManager}) => (
        <InternalFeatureAppContainer
          featureAppManager={featureAppManager}
          {...props}
        />
      )}
    </FeatureHubContextConsumer>
  );
}
