import {AsyncSsrManagerV0} from '..';
import {setTimeoutAsync} from './set-timeout-async';

async function renderingTimeout(timeout: number): Promise<never> {
  await setTimeoutAsync(timeout);

  throw Error(`Got rendering timeout after ${timeout} ms.`);
}

export class AsyncSsrManager implements AsyncSsrManagerV0 {
  private readonly rerenderPromises = new Set<Promise<unknown>>();

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

  public rerender(): void {
    this.rerenderAfter(Promise.resolve());
  }

  public rerenderAfter(promise: Promise<unknown>): void {
    this.rerenderPromises.add(promise);
  }

  private async renderingLoop(render: () => string): Promise<string> {
    let html = render();

    // During a render pass, rerender promises might be added via the
    // rerenderAfter method.
    while (this.rerenderPromises.size > 0) {
      await Promise.all(this.rerenderPromises.values());
      this.rerenderPromises.clear();

      html = render();
    }

    return html;
  }
}
