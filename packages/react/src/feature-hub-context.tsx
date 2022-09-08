import {AsyncSsrManagerV1} from '@feature-hub/async-ssr-manager';
import {FeatureAppManager, Logger} from '@feature-hub/core';
import * as React from 'react';

type SomeRequired<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>> &
  Required<Pick<T, K>>;

export interface Css {
  readonly href: string;
  readonly media?: string;
}

export interface FeatureHubContextProviderValue {
  /**
   * The `FeatureAppManager` singleton instance.
   */
  readonly featureAppManager: FeatureAppManager;

  /**
   * A custom logger that shall be used instead of `console`.
   */
  readonly logger?: Logger;

  /**
   * The Async SSR Manager Feature Service that is bound to the integrator. It
   * is only provided on the server.
   */
  readonly asyncSsrManager?: AsyncSsrManagerV1;

  /**
   * A callback that the integrator provides on the server, mainly for the
   * [[FeatureAppLoader]], to add client URLs of those Feature Apps that are
   * rendered on the server, so that they can be preloaded on the client before
   * hydration. This method might be called multiple times with the same URL
   * during server-side rendering. Therefore deduplication should be considered.
   *
   * @param url The **client** URL of a Feature App that is rendered on the
   * server.
   *
   * @param moduleType The **client** module type of the Feature App that is
   * rendered on the server. This value can be used by the provided
   * [[FeatureAppManagerOptions.moduleLoader]].
   */
  addUrlForHydration?(url: string, moduleType?: string): void;

  /**
   * A callback that the integrator provides on the server, mainly for the
   * [[FeatureAppLoader]], to add stylesheets for those Feature Apps that are
   * rendered on the server, so that they can be added to the document before
   * being sent to the client. This method might be called multiple times with
   * the same list of stylesheets (per Feature App) during server-side
   * rendering. Therefore deduplication should be considered.
   *
   * @param stylesheets A list of stylesheets for a Feature App that is rendered
   * on the server.
   */
  addStylesheetsForSsr?(stylesheets: Css[]): void;
}

export type FeatureHubContextConsumerValue = SomeRequired<
  FeatureHubContextProviderValue,
  'logger'
>;

const noFeatureHubContextValueErrorMessage =
  'No Feature Hub context was provided! There are two possible causes: 1.) No FeatureHubContextProvider was rendered in the React tree. 2.) A Feature App that renders itself a FeatureAppLoader or a FeatureAppContainer did not declare @feature-hub/react as an external package.';

export const FeatureHubContext = React.createContext<
  FeatureHubContextProviderValue | undefined
>(undefined);

/**
 * The integrator must render a `FeatureHubContextProvider` to provide the
 * `FeatureAppManager` singleton instance, as well as the Async SSR Manager
 * Feature Service (optionally), to Feature Hub context consumers, e.g. the
 * [[FeatureAppLoader]] or [[FeatureAppContainer]].
 */
export const FeatureHubContextProvider = FeatureHubContext.Provider;

/**
 * A `FeatureHubContextConsumer` can be used to retrieve the `FeatureAppManager`
 * singleton instance, as well as the Async SSR Manager Feature Service (if it
 * is provided by the integrator). Its main purpose is to be used inside the
 * [[FeatureAppLoader]] and [[FeatureAppContainer]].
 */
export function FeatureHubContextConsumer(
  props: React.ConsumerProps<FeatureHubContextConsumerValue>
): JSX.Element {
  return (
    <FeatureHubContext.Consumer>
      {(featureHubContextValue) => {
        if (!featureHubContextValue) {
          throw new Error(noFeatureHubContextValueErrorMessage);
        }

        // Provide `console` as the default logger.
        const {logger = console, ...rest} = featureHubContextValue;

        return props.children({logger, ...rest});
      }}
    </FeatureHubContext.Consumer>
  );
}
