import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';
import {validateConfig} from './config';
import {debounceAsync} from './internal/debounce-async';
import {PromiseWithStatus} from './internal/promise-with-status';

export {ServerRendererConfig} from './config';

export interface ServerRequest {
  readonly path: string;
  readonly cookies: Record<string, string>;
  readonly headers: Record<string, string>;
}

export type IsCompletedCallback = () => boolean;

export interface ServerRendererV1 {
  readonly serverRequest: ServerRequest | undefined;

  renderUntilCompleted(render: () => string): Promise<string>;

  waitForFeatureApp(
    featureAppClientUrl: string,
    featureAppLoadingEvent: Promise<void>
  ): void;

  register(isCompleted: IsCompletedCallback): void;
  rerender(): Promise<void>;
}

export interface SharedServerRenderer extends SharedFeatureService {
  readonly '1.0': FeatureServiceBinder<ServerRendererV1>;
}

const undefinedRerenderErrorMessage =
  'Invalid state: ServerRenderer#debouncedRerender is undefined.';

export class ServerRenderer implements ServerRendererV1 {
  private debouncedRerender?: () => Promise<void>;

  private readonly consumerCompletedCallbacks: IsCompletedCallback[] = [];

  private readonly loadingFeatureAppModules = new Map<
    string,
    PromiseWithStatus<void>
  >();

  public constructor(
    public serverRequest: ServerRequest | undefined,
    private readonly rerenderWait: number
  ) {}

  public async renderUntilCompleted(render: () => string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const renderAndResolveIfCompleted = () => {
        try {
          const html = render();

          if (this.isRenderingCompleted()) {
            resolve(html);
          } else {
            for (const loadingFeatureAppModule of this.loadingFeatureAppModules.values()) {
              this.handleLoadingFeatureAppModule(loadingFeatureAppModule);
            }
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

  public waitForFeatureApp(
    featureAppClientUrl: string,
    featureAppLoadingEvent: Promise<void>
  ): void {
    if (this.loadingFeatureAppModules.has(featureAppClientUrl)) {
      return;
    }

    const promiseWithStatus = new PromiseWithStatus(featureAppLoadingEvent);

    this.loadingFeatureAppModules.set(featureAppClientUrl, promiseWithStatus);
  }

  public register(isCompleted: IsCompletedCallback): void {
    this.consumerCompletedCallbacks.push(isCompleted);
  }

  public async rerender(): Promise<void> {
    /* istanbul ignore if */
    if (!this.debouncedRerender) {
      throw new Error(undefinedRerenderErrorMessage);
    }

    return this.debouncedRerender();
  }

  private isRenderingCompleted(): boolean {
    for (const loadingFeatureAppModule of this.loadingFeatureAppModules.values()) {
      if (loadingFeatureAppModule.status !== 'final') {
        return false;
      }
    }

    return this.consumerCompletedCallbacks.every(isCompleted => isCompleted());
  }

  private handleLoadingFeatureAppModule(
    loadingFeatureAppModule: PromiseWithStatus<void>
  ): void {
    if (loadingFeatureAppModule.status !== 'new') {
      return;
    }

    const onFulfilledOrRejected = async () => {
      /* istanbul ignore if */
      if (!this.debouncedRerender) {
        throw new Error(undefinedRerenderErrorMessage);
      }

      await this.debouncedRerender();
    };

    loadingFeatureAppModule.then(onFulfilledOrRejected, onFulfilledOrRejected);
  }
}

export function defineServerRenderer(
  serverRequest: ServerRequest | undefined
): FeatureServiceProviderDefinition {
  return {
    id: 's2:server-renderer',

    create: (env): SharedServerRenderer => {
      const {rerenderWait = 50} = validateConfig(env.config) || {};
      const serverRenderer = new ServerRenderer(serverRequest, rerenderWait);

      return {
        '1.0': () => ({featureService: serverRenderer})
      };
    }
  };
}
