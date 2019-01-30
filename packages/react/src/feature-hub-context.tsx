import {AsyncSsrManagerV0} from '@feature-hub/async-ssr-manager';
import {FeatureAppManagerLike} from '@feature-hub/core';
import * as React from 'react';

export interface FeatureHubContextValue {
  /**
   * The `FeatureAppManager` singleton instance.
   */
  featureAppManager: FeatureAppManagerLike;

  /**
   * The Async SSR Manager Feature Service that is bound to the integrator. It
   * is only provided on the server.
   */
  asyncSsrManager?: AsyncSsrManagerV0;

  /**
   * A callback that the integrator provides on the server, mainly for the
   * {@link FeatureAppLoader}, to add browser URLs of those Feature Apps that
   * are rendered on the server, so that they can be preloaded in the browser
   * before hydration. Calling it more than once with the same URL must not have
   * any impact.
   *
   * @param url The browser URL of a Feature App that is rendered on the server.
   */
  addUrlForHydration?(url: string): void;
}

const dummyDefaultFeatureHubContextValue = {};

const noFeatureHubContextValueErrorMessage =
  'No Feature Hub context was provided! There are two possible causes: 1.) No FeatureHubContextProvider was rendered in the React tree. 2.) A Feature App that renders itself a FeatureAppLoader or a FeatureAppContainer did not declare @feature-hub/react as an external package.';

const FeatureHubContext = React.createContext(
  dummyDefaultFeatureHubContextValue as FeatureHubContextValue
);

/**
 * The integrator must render a `FeatureHubContextProvider` to provide the
 * `FeatureAppManager` singleton instance, as well as the Async SSR Manager
 * Feature Service (optionally), to Feature Hub context consumers, e.g. the
 * {@link FeatureAppLoader} or {@link FeatureAppContainer}.
 */
export const FeatureHubContextProvider = FeatureHubContext.Provider;

/**
 * A `FeatureHubContextConsumer` can be used to retrieve the `FeatureAppManager`
 * singleton instance, as well as the Async SSR Manager Feature Service (if it
 * is provided by the integrator). Its main purpose is to be used inside the
 * {@link FeatureAppLoader} and {@link FeatureAppContainer}.
 */
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
