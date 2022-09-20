import {
  FeatureAppDefinition,
  FeatureAppEnvironment,
  FeatureServices,
} from '@feature-hub/core';
import * as React from 'react';
import {
  CustomFeatureAppRenderingParams,
  FeatureApp,
} from './feature-app-container';
import {
  Css,
  FeatureHubContextConsumer,
  FeatureHubContextConsumerValue,
} from './feature-hub-context';
import {InternalFeatureAppContainer} from './internal/internal-feature-app-container';
import {prependBaseUrl} from './internal/prepend-base-url';

export interface FeatureAppLoaderProps<TConfig = unknown> {
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
   * The URL of the Feature App's client module bundle. If [[baseUrl]] is
   * specified, it will be prepended, unless `src` is an absolute URL.
   */
  readonly src: string;

  /**
   * The module type of the Feature App's client module bundle. It is passed to
   * the module loader that was provided as part of
   * [[FeatureAppManagerOptions.moduleLoader]].
   */
  readonly moduleType?: string;

  /**
   * The URL of the Feature App's server module bundle. If [[baseUrl]] is
   * specified, it will be prepended, unless `serverSrc` is an absolute URL.
   * Either [[baseUrl]] or `serverSrc` must be an absolute URL.
   */
  readonly serverSrc?: string;

  /**
   * The module type of the Feature App's server module bundle. It is passed to
   * the module loader that was provided as part of
   * [[FeatureAppManagerOptions.moduleLoader]].
   */
  readonly serverModuleType?: string;

  /**
   * A list of stylesheets to be added to the document. If [[baseUrl]] is
   * specified, it will be prepended, unless [[Css.href]] is an absolute URL.
   */
  readonly css?: Css[];

  /**
   * A config object that is passed to the Feature App's `create` method.
   */
  readonly config?: TConfig;

  /**
   * A callback that is called before the Feature App is created.
   */
  readonly beforeCreate?: (
    env: FeatureAppEnvironment<FeatureServices, TConfig>
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

type InternalFeatureAppLoaderProps<TConfig> = FeatureAppLoaderProps<TConfig> &
  FeatureHubContextConsumerValue;

interface InternalFeatureAppLoaderState {
  readonly featureAppDefinition?: FeatureAppDefinition<unknown>;
  readonly error?: unknown;
  readonly failedToHandleAsyncError?: boolean;
}

const inBrowser =
  typeof window === 'object' &&
  typeof document === 'object' &&
  document.nodeType === 9;

class InternalFeatureAppLoader<TConfig = unknown> extends React.PureComponent<
  InternalFeatureAppLoaderProps<TConfig>,
  InternalFeatureAppLoaderState
> {
  public readonly state: InternalFeatureAppLoaderState = {};

  private errorHandled = false;
  private mounted = false;

  public constructor(props: InternalFeatureAppLoaderProps<TConfig>) {
    super(props);

    const {
      baseUrl,
      featureAppManager,
      src: clientSrc,
      serverSrc,
      asyncSsrManager,
      addUrlForHydration,
      addStylesheetsForSsr,
      moduleType: clientModuleType,
      serverModuleType,
    } = props;

    const src = inBrowser ? clientSrc : serverSrc;
    const moduleType = inBrowser ? clientModuleType : serverModuleType;

    if (!src) {
      if (inBrowser) {
        throw new Error('No src provided.');
      }

      return;
    }

    if (!inBrowser && addUrlForHydration) {
      addUrlForHydration(prependBaseUrl(baseUrl, clientSrc), clientModuleType);
    }

    if (!inBrowser && addStylesheetsForSsr) {
      const css = this.prependCssHrefs();

      if (css) {
        addStylesheetsForSsr(css);
      }
    }

    const url = prependBaseUrl(baseUrl, src);

    const {
      error,
      promise: loadingPromise,
      value: featureAppDefinition,
    } = featureAppManager.getAsyncFeatureAppDefinition(url, moduleType);

    if (error) {
      this.handleError(error);

      this.state = {error};
    } else if (featureAppDefinition) {
      this.state = {featureAppDefinition};
    } else if (!inBrowser && asyncSsrManager) {
      asyncSsrManager.scheduleRerender(loadingPromise);
    }
  }

  public async componentDidMount(): Promise<void> {
    this.mounted = true;

    this.appendCss();

    if (this.state.featureAppDefinition) {
      return;
    }

    const {baseUrl, featureAppManager, src, moduleType} = this.props;

    try {
      const featureAppDefinition = await featureAppManager.getAsyncFeatureAppDefinition(
        prependBaseUrl(baseUrl, src),
        moduleType
      ).promise;

      if (this.mounted) {
        this.setState({featureAppDefinition});
      }
    } catch (error) {
      try {
        this.handleError(error);

        if (this.mounted) {
          this.setState({error});
        }
      } catch (handlerError) {
        if (this.mounted) {
          this.setState({error: handlerError, failedToHandleAsyncError: true});
        }
      }
    }
  }

  public componentWillUnmount(): void {
    this.mounted = false;
  }

  public render(): React.ReactNode {
    const {
      baseUrl,
      beforeCreate,
      children,
      config,
      featureAppId,
      featureAppName,
      onError,
      done,
      featureAppManager,
      logger,
    } = this.props;

    const {error, failedToHandleAsyncError, featureAppDefinition} = this.state;

    if (error) {
      if (failedToHandleAsyncError) {
        throw error;
      }

      if (children) {
        return children({error, loading: false});
      }

      return null;
    }

    if (!featureAppDefinition && !children) {
      return null;
    }

    return (
      <InternalFeatureAppContainer
        children={children}
        baseUrl={baseUrl}
        beforeCreate={beforeCreate}
        config={config}
        featureAppId={featureAppId}
        featureAppName={featureAppName}
        featureAppDefinition={
          featureAppDefinition as FeatureAppDefinition<FeatureApp>
        }
        onError={onError}
        done={done}
        featureAppManager={featureAppManager}
        logger={logger}
      />
    );
  }

  private appendCss(): void {
    const css = this.prependCssHrefs();

    if (!css) {
      return;
    }

    for (const {href, media = 'all'} of css) {
      if (!document.querySelector(`link[href="${href}"]`)) {
        document.head.appendChild(
          Object.assign(document.createElement('link'), {
            rel: 'stylesheet',
            href,
            media,
          })
        );
      }
    }
  }

  private prependCssHrefs(): Css[] | undefined {
    const {baseUrl, css} = this.props;

    if (!baseUrl || !css) {
      return css;
    }

    return css.map(({href, media}) => ({
      href: prependBaseUrl(baseUrl, href),
      media,
    }));
  }

  private handleError(error: unknown): void {
    if (this.errorHandled) {
      return;
    }

    this.errorHandled = true;

    if (this.props.onError) {
      this.props.onError(error);
    } else {
      this.logError(error);
    }
  }

  private logError(error: unknown): void {
    const {
      baseUrl,
      featureAppId,
      logger,
      src: clientSrc,
      serverSrc,
    } = this.props;

    const src = inBrowser ? clientSrc : serverSrc;

    logger.error(
      `The Feature App for the src ${JSON.stringify(
        src && prependBaseUrl(baseUrl, src)
      )} and the ID ${JSON.stringify(featureAppId)} could not be rendered.`,
      error
    );
  }
}

/**
 * The `FeatureAppLoader` component allows the integrator to load Feature Apps
 * from a remote location. It can also be used by a Feature App to render
 * another Feature App as a child.
 *
 * When a Feature App throws an error while rendering or, in the case of a
 * [[ReactFeatureApp]], throws an error in a lifecycle method, the
 * `FeatureAppLoader` renders `null`. On the server, however, rendering
 * errors are not caught and must therefore be handled by the integrator.
 */
export function FeatureAppLoader<TConfig>(
  props: FeatureAppLoaderProps<TConfig>
): JSX.Element {
  return (
    <FeatureHubContextConsumer>
      {(featureHubContextValue) => (
        <InternalFeatureAppLoader<TConfig>
          {...featureHubContextValue}
          {...props}
        />
      )}
    </FeatureHubContextConsumer>
  );
}
