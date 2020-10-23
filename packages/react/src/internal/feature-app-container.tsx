import {FeatureServices, Logger} from '@feature-hub/core';
import * as React from 'react';
import {
  BaseFeatureAppContainerProps,
  FeatureApp
} from '../feature-app-container';
import {FeatureHubContextConsumerValue} from '../feature-hub-context';
import {isDomFeatureApp, isFeatureApp, isReactFeatureApp} from './type-guards';

export const handleError = (
  logger: Logger,
  error: Error,
  onError?: (e: Error) => void
) => {
  if (onError) {
    onError(error);
  } else {
    logger.error(error);
  }
};

export type InternalFeatureAppContainerProps<
  TFeatureApp,
  TFeatureServices extends FeatureServices,
  TConfig
> = BaseFeatureAppContainerProps<TFeatureApp, TFeatureServices, TConfig> &
  Pick<FeatureHubContextConsumerValue, 'featureAppManager' | 'logger'>;

export interface InternalFeatureAppContainerState<
  TFeatureApp extends FeatureApp
> {
  readonly error?: Error;
  readonly featureApp?: TFeatureApp;
  readonly release?: () => void;
  readonly failedToHandleAsyncError?: boolean;
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
      featureAppManager,
      featureAppDefinition,
      done,
      logger,
      onError
    } = props;
    if (featureAppDefinition && !state.featureApp && !state.error) {
      try {
        const featureAppScope = featureAppManager.createFeatureAppScope(
          featureAppId,
          featureAppDefinition,
          {
            baseUrl,
            config,
            beforeCreate,
            done
          }
        );
        const {featureApp, release} = featureAppScope;
        if (!isFeatureApp(featureApp)) {
          throw new Error(
            'Invalid Feature App found. The Feature App must be an object with either 1) a `render` method that returns a React element, or 2) an `attachTo` method that accepts a container DOM element.'
          );
        }

        // If no loading promise was given, "loading" should always be false
        return {
          featureApp,
          release,
          loading: Boolean(featureApp.loadingPromise)
        };
      } catch (error) {
        try {
          handleError(logger, error, onError);
        } catch (handlerError) {
          return {
            error: handlerError,
            loading: false,
            failedToHandleAsyncError: true
          };
        }

        return {error, loading: false};
      }
    }

    return null;
  }

  private readonly containerRef = React.createRef<HTMLDivElement>();
  private mounted = false;
  private loadingPromiseHandled = false;

  public constructor(
    props: InternalFeatureAppContainerProps<
      TFeatureApp,
      TFeatureServices,
      TConfig
    >
  ) {
    super(props);

    this.state = {
      loading: true
    };
  }

  public componentDidCatch(error: Error): void {
    this.handleError(error);

    this.setState({error, loading: false});
  }

  public componentDidMount(): void {
    this.mounted = true;

    const container = this.containerRef.current;

    if (!this.state.featureApp) {
      return;
    }

    if (
      container &&
      !('error' in this.state) &&
      isDomFeatureApp(this.state.featureApp)
    ) {
      try {
        this.state.featureApp.attachTo(container);
      } catch (error) {
        this.componentDidCatch(error);
      }
    }

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

  public componentDidUpdate(): void {
    this.handleLoading();
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
      !this.loadingPromiseHandled &&
      featureApp.loadingPromise
    ) {
      this.loadingPromiseHandled = true;
      featureApp.loadingPromise
        .then(() => {
          this.setState({loading: false});
        })
        .catch(loadingError => {
          try {
            this.handleError(loadingError);
          } catch (handlerError) {
            if (this.mounted) {
              this.setState({
                error: handlerError,
                failedToHandleAsyncError: true,
                loading: false
              });
            }
          }
          if (this.mounted) {
            this.setState({
              error: loadingError,
              failedToHandleAsyncError: false,
              loading: false
            });
          }
        });
    }
  }

  private renderError(error: Error): React.ReactNode {
    // tslint:disable-next-line: deprecation
    const {children, renderError} = this.props;

    if (children) {
      return children({error, loading: false});
    }

    if (renderError) {
      return renderError(error);
    }

    return null;
  }

  private handleError(error: Error): void {
    const {logger, onError} = this.props;

    handleError(logger, error, onError);
  }
}
