import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';
import {AsyncSsrManager} from './internal/async-ssr-manager';
import {validateConfig} from './internal/validate-config';

export interface AsyncSsrManagerConfig {
  /**
   * Render timeout in milliseconds.
   */
  readonly timeout?: number;
}

/**
 * The Async SSR Manager enables the integrator to render any given composition
 * of React Feature Apps in multiple render passes until all Feature Apps and
 * Feature Services have finished their asynchronous operations.
 *
 * The integrator should provide the Async SSR Manager only on the server.
 *
 * Feature Apps and Feature Services should declare the Async SSR Manager as an
 * optional dependency. Its presence can be used to determine whether they are
 * currently rendered on the server or on the client.
 */
export interface AsyncSsrManagerV0 {
  /**
   * This method is intended for the integrator. It calls the given render
   * funtion in a loop as long as there are unresolved rerender promises, and
   * resolves with the result of the last render call.
   *
   * @throws Throws an error when the configured timeout is reached
   * (see {@link AsyncSsrManagerConfig.timeout}).
   *
   * @param render A render function that is called for each render pass.
   */
  renderUntilCompleted(render: () => string): Promise<string>;

  /**
   * This method is intended for consumers, i.e. Feature Apps and Feature
   * Services. It schedules a rerender with a promise. The method must be called
   * synchronously during a render pass, since the Async SSR Manager
   * synchronously checks after every render pass whether there are rerender
   * promises it needs to await, and then do another render pass.
   *
   * @param promise When this promise resolves, a rerender should be triggered.
   */
  rerenderAfter(promise: Promise<unknown>): void;
}

export interface SharedAsyncSsrManager extends SharedFeatureService {
  readonly '0.1': FeatureServiceBinder<AsyncSsrManagerV0>;
}

/**
 * @see {@link AsyncSsrManagerV0} for further information.
 */
export const asyncSsrManagerDefinition: FeatureServiceProviderDefinition<
  SharedAsyncSsrManager
> = {
  id: 's2:async-ssr-manager',

  create: env => {
    const {timeout} =
      validateConfig(env.config) || ({} as AsyncSsrManagerConfig);

    const asyncSsrManager = new AsyncSsrManager(timeout);

    return {
      '0.1': () => ({featureService: asyncSsrManager})
    };
  }
};
