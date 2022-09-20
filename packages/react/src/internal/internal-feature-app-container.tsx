import {
  FeatureAppDefinition,
  FeatureAppEnvironment,
  FeatureServices,
  Logger,
} from '@feature-hub/core';
import * as React from 'react';
import {
  CustomFeatureAppRenderingParams,
  FeatureApp,
} from '../feature-app-container';
import {FeatureHubContextConsumerValue} from '../feature-hub-context';
import {isDomFeatureApp, isFeatureApp, isReactFeatureApp} from './type-guards';

export const handleError = (
  logger: Logger,
  error: unknown,
  onError?: (e: unknown) => void
) => {
  if (onError) {
    onError(error);
  } else {
    logger.error(error);
  }
};

export interface BaseFeatureAppContainerProps<
  TFeatureApp,
  TFeatureServices extends FeatureServices = FeatureServices,
  TConfig = unknown
> {
  /**
   * The Feature App ID is used to identify the Feature App instance. Multiple
   * Feature App Loaders with the same `featureAppId` will render the same
   * Feature app instance. The ID is also used as a consumer ID for dependent
   * Feature Services. To render multiple instances of the same kind of Feature
   * App, different IDs must be used.
   */
  readonly featureAppId: string;

  /**
   * The Feature App's name. In contrast to the `featureAppId`, the name must
   * not be unique. It can be used by required Feature Services for display
   * purposes, logging, looking up Feature App configuration meta data, etc.
   */
  readonly featureAppName?: string;

  /**
   * The absolute or relative base URL of the Feature App's assets and/or BFF.
   */
  readonly baseUrl?: string;

  /**
   * The consumer definition of the Feature App.
   */
  readonly featureAppDefinition?: FeatureAppDefinition<
    TFeatureApp,
    TFeatureServices,
    TConfig
  >;

  /**
   * A config object that is passed to the Feature App's `create` method.
   */
  readonly config?: TConfig;

  /**
   * A callback that is called before the Feature App is created.
   */
  readonly beforeCreate?: (
    env: FeatureAppEnvironment<TFeatureServices, TConfig>
  ) => void;

  /**
   * A callback that is passed to the Feature App's `create` method. A
   * short-lived Feature App can call this function when it has completed its
   * task. The Integrator (or parent Feature App) can then decide to e.g.
   * unmount the Feature App.
   *
   * Optionally, the Feature App can pass a result into the done callback. The
   * type/structure of the result must be agreed between the Integrator (or
   * parent Feature App) and the Feature App.
   */
  readonly done?: (result?: unknown) => void;

  readonly onError?: (error: unknown) => void;

  /**
   * A children function can be provided to customize rendering of the
   * Feature App and provide Error or Loading UIs.
   */
  readonly children?: (
    params: CustomFeatureAppRenderingParams
  ) => React.ReactNode;
}

export type InternalFeatureAppContainerProps<
  TFeatureApp,
  TFeatureServices extends FeatureServices,
  TConfig
> = BaseFeatureAppContainerProps<TFeatureApp, TFeatureServices, TConfig> &
  Pick<FeatureHubContextConsumerValue, 'featureAppManager' | 'logger'>;

interface InternalFeatureAppContainerState<TFeatureApp extends FeatureApp> {
  readonly error?: unknown;
  readonly featureApp?: TFeatureApp;
  readonly release?: () => void;
  readonly failedToHandleAsyncError?: boolean;
  /**
   * If no loading promise was given, "loading" should always be false.
   */
  readonly loading: boolean;
}

export class InternalFeatureAppContainer<
  TFeatureApp extends FeatureApp,
  TFeatureServices extends FeatureServices = FeatureServices,
  TConfig = unknown
> extends React.PureComponent<
  InternalFeatureAppContainerProps<TFeatureApp, TFeatureServices, TConfig>,
  InternalFeatureAppContainerState<TFeatureApp>
> {
  public static getDerivedStateFromProps(
    props: InternalFeatureAppContainerProps<unknown, FeatureServices, unknown>,
    state: InternalFeatureAppContainerState<FeatureApp>
  ): Partial<InternalFeatureAppContainerState<FeatureApp>> | null {
    const {
      baseUrl,
      beforeCreate,
      config,
      featureAppId,
      featureAppName,
      featureAppManager,
      featureAppDefinition,
      done,
      logger,
      onError,
    } = props;

    if (featureAppDefinition && !state.featureApp && !state.error) {
      try {
        const featureAppScope = featureAppManager.createFeatureAppScope(
          featureAppId,
          featureAppDefinition,
          {featureAppName, baseUrl, config, beforeCreate, done}
        );

        const {featureApp, release} = featureAppScope;

        if (!isFeatureApp(featureApp)) {
          throw new Error(
            'Invalid Feature App found. The Feature App must be an object with either 1) a `render` method that returns a React element, or 2) an `attachTo` method that accepts a container DOM element.'
          );
        }

        return {
          featureApp,
          release,
          loading: Boolean(featureApp.loadingPromise),
        };
      } catch (error) {
        try {
          handleError(logger, error, onError);
        } catch (handlerError) {
          return {
            error: handlerError,
            loading: false,
            failedToHandleAsyncError: true,
          };
        }

        return {error, loading: false};
      }
    }

    return null;
  }

  public state: InternalFeatureAppContainerState<TFeatureApp> = {loading: true};

  private readonly containerRef = React.createRef<HTMLDivElement>();
  private mounted = false;
  private loadingPromiseHandled = false;
  private domFeatureAppAttached = false;

  public componentDidCatch(error: unknown): void {
    this.handleError(error);
    this.setState({error, loading: false});
  }

  public componentDidMount(): void {
    this.mounted = true;
    this.attachDomFeatureApp();
    this.handleLoading();
  }

  public componentDidUpdate(): void {
    this.attachDomFeatureApp();
    this.handleLoading();
  }

  public componentWillUnmount(): void {
    this.mounted = false;

    if (this.state && this.state.release) {
      try {
        this.state.release();
      } catch (error) {
        this.handleError(error);
      }
    }
  }

  public render(): React.ReactNode {
    if ('error' in this.state && this.state.error) {
      if (this.state.failedToHandleAsyncError) {
        throw this.state.error;
      }

      return this.renderError(this.state.error);
    }

    if (!this.state.featureApp) {
      return this.props.children ? this.props.children({loading: true}) : null;
    }

    const {featureApp, loading} = this.state;

    let featureAppNode: React.ReactNode;

    if (isReactFeatureApp(featureApp)) {
      try {
        featureAppNode = featureApp.render();
      } catch (error) {
        this.handleError(error);

        return this.renderError(error);
      }
    } else {
      featureAppNode = <div ref={this.containerRef} />;
    }

    return this.props.children
      ? this.props.children({featureAppNode, loading})
      : featureAppNode;
  }

  private handleLoading(): void {
    const {featureApp} = this.state;

    if (
      featureApp &&
      featureApp.loadingPromise &&
      !this.loadingPromiseHandled
    ) {
      this.loadingPromiseHandled = true;

      featureApp.loadingPromise
        .then(() => {
          if (this.mounted) {
            this.setState({loading: false});
          }
        })
        .catch((loadingError) => {
          try {
            this.handleError(loadingError);

            if (this.mounted) {
              this.setState({
                error: loadingError,
                failedToHandleAsyncError: false,
                loading: false,
              });
            }
          } catch (handlerError) {
            if (this.mounted) {
              this.setState({
                error: handlerError,
                failedToHandleAsyncError: true,
                loading: false,
              });
            }
          }
        });
    }
  }

  private renderError(error: unknown): React.ReactNode {
    const {children} = this.props;

    return children ? children({error, loading: false}) : null;
  }

  private handleError(error: unknown): void {
    const {logger, onError} = this.props;

    handleError(logger, error, onError);
  }

  private attachDomFeatureApp(): void {
    if (
      this.state.featureApp &&
      !this.domFeatureAppAttached &&
      this.containerRef.current &&
      !('error' in this.state) &&
      isDomFeatureApp(this.state.featureApp)
    ) {
      try {
        this.state.featureApp.attachTo(this.containerRef.current);
        this.domFeatureAppAttached = true;
      } catch (error) {
        this.componentDidCatch(error);
      }
    }
  }
}
