import {AsyncSsrManagerV1} from '..';
import {setTimeoutAsync} from './set-timeout-async';

async function renderingTimeout(timeout: number): Promise<never> {
  await setTimeoutAsync(timeout);

  throw Error(`Got rendering timeout after ${timeout} ms.`);
}

export class AsyncSsrManager implements AsyncSsrManagerV1 {
  private readonly asyncOperations = new Set<Promise<unknown>>();

  public constructor(private readonly timeout?: number) {}

  public async renderUntilCompleted(render: () => string): Promise<string> {
    const renderPromise = this.renderingLoop(render);

    if (typeof this.timeout !== 'number') {
      console.warn(
        'No timeout is configured for the Async SSR Manager. This could lead to unexpectedly long render times or, in the worst case, never resolving render calls!'
      );

      return renderPromise;
    }

    return Promise.race([renderPromise, renderingTimeout(this.timeout)]);
  }

  public scheduleRerender(
    asyncOperation: Promise<unknown> = Promise.resolve()
  ): void {
    this.asyncOperations.add(asyncOperation);
  }

  private async renderingLoop(render: () => string): Promise<string> {
    let html = render();

    while (this.asyncOperations.size > 0) {
      while (this.asyncOperations.size > 0) {
        // Storing a snapshot of the asynchronous operations and clearing them
        // afterwards allows that consecutive promises can be added while the
        // current asynchronous operations are running.

        const asyncOperationsSnapshot = Array.from(
          this.asyncOperations.values()
        );

        this.asyncOperations.clear();

        await Promise.all(asyncOperationsSnapshot);
      }

      html = render();
    }

    return html;
  }
}
