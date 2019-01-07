import {debounceAsync} from './internal/debounce-async';

export interface ServerRequest {
  readonly path: string;
  readonly cookies: Record<string, string>;
  readonly headers: Record<string, string>;
}

export type IsCompletedCallback = () => boolean;

export interface ServerRendererV1 {
  readonly serverRequest: ServerRequest | undefined;

  renderUntilCompleted(render: () => string): Promise<string>;
  register(isCompleted: IsCompletedCallback): void;
  rerender(): Promise<void>;
}

export class ServerRenderer implements ServerRendererV1 {
  private debouncedRerender?: () => Promise<void>;

  private readonly consumerCompletedCallbacks: IsCompletedCallback[] = [];

  public constructor(
    public serverRequest: ServerRequest | undefined,
    private readonly rerenderWait: number
  ) {}

  public async renderUntilCompleted(render: () => string): Promise<string> {
    if (this.debouncedRerender) {
      throw new Error('Rendering has already been started.');
    }

    return this.startRendering(render);
  }

  public register(isCompleted: IsCompletedCallback): void {
    this.consumerCompletedCallbacks.push(isCompleted);
  }

  public async rerender(): Promise<void> {
    /* istanbul ignore if */
    if (!this.debouncedRerender) {
      throw new Error(
        'Invalid state: ServerRenderer#debouncedRerender is undefined.'
      );
    }

    return this.debouncedRerender();
  }

  private async startRendering(render: () => string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const renderAndResolveIfCompleted = () => {
        try {
          const html = render();

          if (this.isRenderingCompleted()) {
            resolve(html);
          }
        } catch (error) {
          reject(error);
        }
      };

      this.debouncedRerender = debounceAsync(
        renderAndResolveIfCompleted,
        this.rerenderWait
      );

      renderAndResolveIfCompleted();
    });
  }

  private isRenderingCompleted(): boolean {
    return this.consumerCompletedCallbacks.every(isCompleted => isCompleted());
  }
}
