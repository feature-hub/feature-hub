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
 * The Async SSR Manager enables the integrator to render a given composition
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
   * function at least once. With {@link scheduleRerender} further render passes
   * can be triggered. It resolves with the result of the last render call.
   *
   * @throws Throws an error when the configured timeout is reached
   * (see {@link AsyncSsrManagerConfig.timeout}).
   *
   * @param render A render function that is called for each render pass.
   */
  renderUntilCompleted(render: () => string): Promise<string>;

  /**
   * This method is intended for consumers, i.e. Feature Apps and Feature
   * Services. It schedules a rerender with an optional promise representing an
   * asynchronous operation. The method must be called synchronously during a
   * render pass, or while already scheduled asynchronous operations are
   * running.
   *
   * Calling it while already scheduled asynchronous operations are running,
   * does not lead to multiple render passes, but instead the already scheduled
   * rerender is deferred until every registered asynchronous operation has
   * finished.
   *
   * @param asyncOperation The scheduled rerender shall be deferred at least
   * until after this asynchronous operation has finished.
   */
  scheduleRerender(asyncOperation?: Promise<unknown>): void;
}

export interface SharedAsyncSsrManager extends SharedFeatureService {
  readonly '0.1.0': FeatureServiceBinder<AsyncSsrManagerV0>;
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
      '0.1.0': () => ({featureService: asyncSsrManager})
    };
  }
};
