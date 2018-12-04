import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';
import {debounceAsync} from './internal/debounce-async';

export interface ServerRequest {
  readonly path: string;
  readonly cookies: Record<string, string>;
  readonly headers: Record<string, string>;
}

export interface ServerRendererV1 {
  readonly serverRequest: ServerRequest | undefined;

  startRendering(render: () => string): Promise<string>;
  waitForFeatureApp(
    featureAppClientUrl: string,
    featureAppLoadingEvent: Promise<void>
  ): void;
  register(isCompleted: () => boolean): void;
  rerender(): Promise<void>;
}

export interface SharedServerRenderer extends SharedFeatureService {
  readonly '1.0': FeatureServiceBinder<ServerRendererV1>;
}

interface PromiseWithStatus<TResult> {
  readonly promise: Promise<TResult>;
  status: 'new' | 'pending' | 'final';
}

const undefinedRerenderErrorMessage =
  'Invalid state: ServerRenderer#debouncedRerender is undefined.';

export class ServerRenderer implements ServerRendererV1 {
  private debouncedRerender?: () => Promise<void>;
  private registeredConsumers: (() => boolean)[] = [];
  private loadingFeatureAppModules = new Map<string, PromiseWithStatus<void>>();

  public constructor(
    public serverRequest: ServerRequest | undefined,
    private rerenderWait: number = 50 // TODO: remove default, extract from config
  ) {}

  public async startRendering(render: () => string): Promise<string> {
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

    const promiseWithStatus: PromiseWithStatus<void> = {
      promise: featureAppLoadingEvent,
      status: 'new'
    };

    this.loadingFeatureAppModules.set(featureAppClientUrl, promiseWithStatus);
  }

  public register(isCompleted: () => boolean): void {
    this.registeredConsumers.push(isCompleted);
  }

  public async rerender(): Promise<void> {
    /* istanbul ignore if */
    if (!this.debouncedRerender) {
      throw new Error(undefinedRerenderErrorMessage);
    }

    return this.debouncedRerender();
  }

  private isRenderingCompleted(): boolean {
    for (const {status} of this.loadingFeatureAppModules.values()) {
      if (status !== 'final') {
        return false;
      }
    }

    return this.registeredConsumers.every(isCompleted => isCompleted());
  }

  private handleLoadingFeatureAppModule(
    loadingFeatureAppModule: PromiseWithStatus<void>
  ): void {
    if (loadingFeatureAppModule.status !== 'new') {
      return;
    }

    loadingFeatureAppModule.status = 'pending';

    const onFulfilledOrRejected = async () => {
      loadingFeatureAppModule.status = 'final';

      /* istanbul ignore if */
      if (!this.debouncedRerender) {
        throw new Error(undefinedRerenderErrorMessage);
      }

      await this.debouncedRerender();
    };

    loadingFeatureAppModule.promise.then(
      onFulfilledOrRejected,
      onFulfilledOrRejected
    );
  }
}

export function defineServerRenderer(
  serverRequest: ServerRequest | undefined
): FeatureServiceProviderDefinition {
  return {
    id: 's2:server-renderer',

    create(): SharedServerRenderer {
      const serverRenderer = new ServerRenderer(serverRequest);

      return {
        '1.0': () => ({featureService: serverRenderer})
      };
    }
  };
}
