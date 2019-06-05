import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  FeatureServices,
  SharedFeatureService
} from '@feature-hub/core';
import {Logger} from '@feature-hub/logger';
import {AsyncSsrManager} from './internal/async-ssr-manager';
import {createAsyncSsrManagerContext} from './internal/async-ssr-manager-context';

export interface AsyncSsrManagerOptions {
  /**
   * Render timeout in milliseconds.
   */
  readonly timeout?: number;
}

/**
 * @deprecated Use [[AsyncSsrManagerV1]] instead.
 */
export type AsyncSsrManagerV0 = AsyncSsrManagerV1;

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
export interface AsyncSsrManagerV1 {
  /**
   * This method is intended for the integrator. It calls the given render
   * function at least once. With [[scheduleRerender]] further render passes
   * can be triggered. It resolves with the result of the last render call.
   *
   * @throws Throws an error when the configured timeout is reached
   * (see [[AsyncSsrManagerConfig.timeout]]).
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
   * If no asynchronous operation is running, the method must be called
   * synchronously during a render pass. This means that the following will
   * **not** work:
   *
   * ```js
   * const data = await fetch('example.com').then(res => res.json());
   * // the rerender scheduled in the next line is not taken into account
   * asyncSsrManager.scheduleRerender();
   * ```
   *
   * Instead, the rerender should be scheduled before awaiting the asynchronous
   * operation:
   *
   * ```js
   * const dataPromise = fetch('example.com').then(res => res.json());
   * asyncSsrManager.scheduleRerender(dataPromise);
   * const data = await dataPromise;
   * ```
   *
   * Calling it while already scheduled asynchronous operations are running,
   * does not lead to multiple render passes, but instead the already scheduled
   * rerender is deferred until every registered asynchronous operation has
   * finished.
   *
   * @param asyncOperation A promise representing an asynchronous operation that
   * shall defer the scheduled rerender at least until after its completion.
   */
  scheduleRerender(asyncOperation?: Promise<unknown>): void;
}

export interface SharedAsyncSsrManager extends SharedFeatureService {
  readonly '1.0.0': FeatureServiceBinder<AsyncSsrManagerV1>;
}

export interface AsyncSsrManagerDependencies extends FeatureServices {
  readonly 's2:logger'?: Logger;
}

/**
 * @see [[AsyncSsrManagerV1]] for further information.
 */
export function defineAsyncSsrManager(
  options: AsyncSsrManagerOptions = {}
): FeatureServiceProviderDefinition<
  SharedAsyncSsrManager,
  AsyncSsrManagerDependencies
> {
  return {
    id: 's2:async-ssr-manager',

    optionalDependencies: {
      featureServices: {
        's2:logger': '^1.0.0'
      }
    },

    create: env => {
      const context = createAsyncSsrManagerContext(env.featureServices);
      const asyncSsrManager = new AsyncSsrManager(context, options.timeout);

      return {
        '1.0.0': () => ({featureService: asyncSsrManager})
      };
    }
  };
}
