import {AsyncLocalStorage} from 'async_hooks';
import {AsyncSsrManagerV1} from '..';
import {AsyncSsrManagerContext} from './async-ssr-manager-context';
import {setTimeoutAsync} from './set-timeout-async';

export interface AsyncOperationQueues {
  contentLoading: Set<Promise<unknown>>;
  jsLoading: Set<Promise<unknown>>;
}

async function renderingTimeout(timeout: number): Promise<never> {
  await setTimeoutAsync(timeout);

  throw Error(`Got rendering timeout after ${timeout} ms.`);
}

export class AsyncSsrManager implements AsyncSsrManagerV1 {
  private readonly asyncOperationsStorage =
    new AsyncLocalStorage<AsyncOperationQueues>();

  public constructor(
    private readonly context: AsyncSsrManagerContext,
    private readonly timeout?: number,
  ) {}

  public async renderUntilCompleted(
    render: () => Promise<string> | string,
  ): Promise<string> {
    const asyncOperations = {
      contentLoading: new Set<Promise<unknown>>(),
      jsLoading: new Set<Promise<unknown>>(),
    };

    return this.asyncOperationsStorage.run(asyncOperations, async () => {
      const renderPromise = this.renderingLoop(render, asyncOperations);

      if (typeof this.timeout !== 'number') {
        this.context.logger.warn(
          'No timeout is configured for the Async SSR Manager. This could lead to unexpectedly long render times or, in the worst case, never resolving render calls!',
        );

        return renderPromise;
      }

      return Promise.race([renderPromise, renderingTimeout(this.timeout)]);
    });
  }

  public scheduleRerender(
    asyncOperation: Promise<unknown> = Promise.resolve(),
  ): void {
    const asyncOperations = this.asyncOperationsStorage.getStore();

    if (!asyncOperations) {
      throw new Error(
        'Async SSR Manager: Can not call `scheduleRerender` outside of `renderUntilCompleted`.',
      );
    }

    asyncOperations.contentLoading.add(asyncOperation);
  }

  public _scheduleJsLoading(
    asyncOperation: Promise<unknown> = Promise.resolve(),
  ): void {
    const asyncOperations = this.asyncOperationsStorage.getStore();

    if (!asyncOperations) {
      throw new Error(
        'Async SSR Manager: Can not call `_scheduleJsLoading` outside of `renderUntilCompleted`.',
      );
    }

    asyncOperations.jsLoading.add(asyncOperation);
  }

  private async renderingLoop(
    render: () => Promise<string> | string,
    asyncOperations: AsyncOperationQueues,
  ): Promise<string> {
    let inProgress = true;
    let html = await render();

    // The rendering loop executes in "waves" until both queues are empty.
    // The `progress` flag acts as a sentinel: if no promise was processed
    // during a full wave, the loop terminates (convergence).

    while (inProgress) {
      inProgress = false;

      while (asyncOperations.contentLoading.size > 0) {
        while (asyncOperations.contentLoading.size > 0) {
          inProgress = true;

          // Storing a snapshot of the asynchronous operations and clearing them
          // afterwards, allows that consecutive promises can be added while the
          // current asynchronous operations are running.

          const asyncOperationsSnapshot = Array.from(
            asyncOperations.contentLoading.values(),
          );

          asyncOperations.contentLoading.clear();

          await Promise.all(asyncOperationsSnapshot);
        }

        html = await render();
      }

      while (asyncOperations.jsLoading.size > 0) {
        while (asyncOperations.jsLoading.size > 0) {
          inProgress = true;

          const asyncOperationsSnapshot = Array.from(
            asyncOperations.jsLoading.values(),
          );

          asyncOperations.jsLoading.clear();

          // Promise rejections are allowed here, to be able to handle the error
          // in <FeatureAppLoader />.

          await Promise.allSettled(asyncOperationsSnapshot);
        }

        html = await render();
      }
    }

    return html;
  }
}
