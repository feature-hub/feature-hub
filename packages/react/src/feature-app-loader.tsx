import {FeatureAppDefinition} from '@feature-hub/core';
import * as React from 'react';
import {FeatureAppContainer} from './feature-app-container';
import {
  FeatureHubContextConsumer,
  FeatureHubContextConsumerValue
} from './feature-hub-context';

export interface Css {
  readonly href: string;
  readonly media?: string;
}

export interface FeatureAppLoaderProps {
  /**
   * The URL of the Feature App's client module bundle.
   */
  readonly src: string;

  /**
   * The URL of the Feature App's server module bundle.
   */
  readonly serverSrc?: string;

  /**
   * A list of stylesheets that should be added to the document.
   */
  readonly css?: Css[];

  /**
   * If multiple instances of the same Feature App are placed on a single web
   * page, an `idSpecifier` that is unique for the Feature App ID must be
   * defined.
   */
  readonly idSpecifier?: string;

  /**
   * A config object that is intended for the specific Feature App instance that
   * the `FeatureAppLoader` loads and renders.
   */
  readonly instanceConfig?: unknown;

  readonly onError?: (error: Error) => void;

  readonly renderError?: (error: Error) => React.ReactNode;
}

type InternalFeatureAppLoaderProps = FeatureAppLoaderProps &
  FeatureHubContextConsumerValue;

interface InternalFeatureAppLoaderState {
  readonly featureAppDefinition?: FeatureAppDefinition<unknown>;
  readonly error?: Error;
  readonly failedToHandleAsyncError?: boolean;
}

const inBrowser =
  typeof window === 'object' &&
  typeof document === 'object' &&
  document.nodeType === 9;

class InternalFeatureAppLoader extends React.PureComponent<
  InternalFeatureAppLoaderProps,
  InternalFeatureAppLoaderState
> {
  public readonly state: InternalFeatureAppLoaderState = {};

  private errorHandled = false;
  private mounted = false;

  public constructor(props: InternalFeatureAppLoaderProps) {
    super(props);

    const {
      featureAppManager,
      src: clientSrc,
      serverSrc,
      asyncSsrManager,
      addUrlForHydration
    } = props;

    const src = inBrowser ? clientSrc : serverSrc;

    if (!src) {
      if (inBrowser) {
        throw new Error('No src provided.');
      }

      return;
    }

    if (!inBrowser && addUrlForHydration) {
      addUrlForHydration(clientSrc);
    }

    const {
      error,
      promise: loadingPromise,
      value: featureAppDefinition
    } = featureAppManager.getAsyncFeatureAppDefinition(src);

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

    const {featureAppManager, src} = this.props;

    const asyncFeatureAppDefinition = featureAppManager.getAsyncFeatureAppDefinition(
      src
    );

    try {
      const featureAppDefinition = await asyncFeatureAppDefinition.promise;

      if (this.mounted) {
        this.setState({featureAppDefinition});
      }
    } catch (loadingError) {
      try {
        this.handleError(loadingError);

        if (this.mounted) {
          this.setState({error: loadingError});
        }
      } catch (handledError) {
        if (this.mounted) {
          this.setState({error: handledError, failedToHandleAsyncError: true});
        }
      }
    }
  }

  public componentWillUnmount(): void {
    this.mounted = false;
  }

  public render(): React.ReactNode {
    const {idSpecifier, instanceConfig, onError, renderError} = this.props;
    const {error, failedToHandleAsyncError, featureAppDefinition} = this.state;

    if (error) {
      if (failedToHandleAsyncError) {
        throw error;
      }

      return renderError ? renderError(error) : null;
    }

    if (!featureAppDefinition) {
      // A loading UI could be rendered here.
      return null;
    }

    return (
      <FeatureAppContainer
        featureAppDefinition={featureAppDefinition}
        idSpecifier={idSpecifier}
        instanceConfig={instanceConfig}
        onError={onError}
        renderError={renderError}
      />
    );
  }

  private appendCss(): void {
    if (!this.props.css) {
      return;
    }

    for (const {href, media} of this.props.css) {
      if (!document.querySelector(`link[href="${href}"]`)) {
        const attributes = {rel: 'stylesheet', href, media: media || 'all'};
        const element = Object.assign(
          document.createElement('link'),
          attributes
        );

        document.head.appendChild(element);
      }
    }
  }

  private handleError(error: Error): void {
    if (this.errorHandled) {
      return;
    }

    this.errorHandled = true;

    const {
      idSpecifier,
      logger,
      onError,
      src: clientSrc,
      serverSrc
    } = this.props;

    if (onError) {
      onError(error);
    } else {
      const src = inBrowser ? clientSrc : serverSrc;

      logger.error(
        idSpecifier
          ? `The Feature App for the src ${JSON.stringify(
              src
            )} and the ID specifier ${JSON.stringify(
              idSpecifier
            )} could not be rendered.`
          : `The Feature App for the src ${JSON.stringify(
              src
            )} could not be rendered.`,
        error
      );

      /**
       * @deprecated Should be handled instead by providing onError that throws.
       * Remove this legacy branch for version 2.0 of @feature-hub/react.
       */
      if (!inBrowser) {
        throw error;
      }
    }
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
export function FeatureAppLoader(props: FeatureAppLoaderProps): JSX.Element {
  return (
    <FeatureHubContextConsumer>
      {featureHubContextValue => (
        <InternalFeatureAppLoader {...featureHubContextValue} {...props} />
      )}
    </FeatureHubContextConsumer>
  );
}
