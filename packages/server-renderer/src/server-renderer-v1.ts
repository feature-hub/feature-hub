import {setTimeoutAsync} from './internal/set-timeout-async';

export interface ServerRequest {
  readonly path: string;
  readonly cookies: Record<string, string>;
  readonly headers: Record<string, string>;
}

export type IsCompletedCallback = () => boolean;

export interface ServerRendererV1 {
  readonly serverRequest: ServerRequest | undefined;

  renderUntilCompleted(render: () => string): Promise<string>;
  rerenderAfter(promise: Promise<unknown>): void;
}

export class ServerRenderer implements ServerRendererV1 {
  private readonly rerenderPromises = new Set<Promise<unknown>>();

  public constructor(
    public readonly serverRequest: ServerRequest | undefined,
    private readonly timeout: number
  ) {}

  public async renderUntilCompleted(render: () => string): Promise<string> {
    return Promise.race([this.renderingLoop(render), this.renderingTimeout()]);
  }

  public rerenderAfter(promise: Promise<unknown>): void {
    this.rerenderPromises.add(promise);
  }

  private async renderingTimeout(): Promise<never> {
    await setTimeoutAsync(this.timeout);

    throw Error(`Got rendering timeout after ${this.timeout} ms.`);
  }

  private async renderingLoop(render: () => string): Promise<string> {
    try {
      let html = render();

      // During a render pass, rerender promises might be added via the
      // rerenderAfter method.
      while (this.rerenderPromises.size > 0) {
        await Promise.all(this.rerenderPromises.values());
        this.rerenderPromises.clear();

        html = render();
      }

      return html;
    } catch (error) {
      throw error;
    }
  }
}
