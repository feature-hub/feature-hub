import {AsyncLocalStorage} from 'async_hooks';
import {AsyncSsrManagerV1} from '..';
import {AsyncSsrManagerContext} from './async-ssr-manager-context';
import {setTimeoutAsync} from './set-timeout-async';

export interface AsyncOperationQueues {
  contentLoading: Set<Promise<unknown>>;
  jsLoading: Set<Promise<unknown>>;
}

export interface AsyncOperationSnapshot {
  contentLoading: Promise<unknown>[];
  jsLoading: Promise<unknown>[];
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

  private isPromiseExisting(asyncOperations: AsyncOperationQueues): boolean {
    return Object.values(asyncOperations).some((queue) => queue.size > 0);
  }

  private cloneQueue(
    asyncOperations: AsyncOperationQueues,
  ): AsyncOperationSnapshot {
    // Storing a snapshot of the asynchronous operations and clearing them
    // afterward, allows that consecutive promises can be added while the
    // current asynchronous operations are running.
    const asyncOperationSnapshot = {} as AsyncOperationSnapshot;

    (Object.keys(asyncOperations) as (keyof AsyncOperationQueues)[]).forEach(
      (queue) => {
        asyncOperationSnapshot[queue] = Array.from(
          asyncOperations[queue].values(),
        );
        asyncOperations[queue].clear();
      },
    );

    return asyncOperationSnapshot;
  }

  private async renderingLoop(
    render: () => Promise<string> | string,
    asyncOperations: AsyncOperationQueues,
  ): Promise<string> {
    let html = await render();

    while (this.isPromiseExisting(asyncOperations)) {
      while (this.isPromiseExisting(asyncOperations)) {
        const asyncOperationsSnapshot = this.cloneQueue(asyncOperations);

        await Promise.all(asyncOperationsSnapshot.contentLoading);
        await Promise.allSettled(asyncOperationsSnapshot.jsLoading);
      }

      html = await render();
    }

    return html;
  }
}
