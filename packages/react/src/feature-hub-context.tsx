import {AsyncSsrManagerV0} from '@feature-hub/async-ssr-manager';
import {FeatureAppManagerLike} from '@feature-hub/core';
import * as React from 'react';

export interface FeatureHubContextValue {
  featureAppManager: FeatureAppManagerLike;
  asyncSsrManager?: AsyncSsrManagerV0;
}

const dummyDefaultFeatureHubContextValue = {};

const noFeatureHubContextValueErrorMessage =
  'No Feature Hub context was provided! There are two possible causes: 1.) No FeatureHubContextProvider was rendered in the React tree. 2.) A Feature App that renders itself a FeatureAppLoader or a FeatureAppContainer did not declare @feature-hub/react as an external package.';

const FeatureHubContext = React.createContext(
  dummyDefaultFeatureHubContextValue as FeatureHubContextValue
);

export const FeatureHubContextProvider = FeatureHubContext.Provider;

export const FeatureHubContextConsumer = (
  props: React.ConsumerProps<FeatureHubContextValue>
) => (
  <FeatureHubContext.Consumer>
    {value => {
      if (value === dummyDefaultFeatureHubContextValue) {
        throw new Error(noFeatureHubContextValueErrorMessage);
      }

      return props.children(value);
    }}
  </FeatureHubContext.Consumer>
);

FeatureHubContextConsumer.displayName = 'FeatureHubContextConsumer';
