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
}

type InternalFeatureAppLoaderProps = FeatureAppLoaderProps &
  FeatureHubContextConsumerValue;

interface InternalFeatureAppLoaderState {
  readonly featureAppDefinition?: FeatureAppDefinition<unknown>;
  readonly hasError?: boolean;
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

  private errorReported = false;
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

    const asyncFeatureAppDefinition = featureAppManager.getAsyncFeatureAppDefinition(
      src
    );

    if (asyncFeatureAppDefinition.error) {
      this.reportError(asyncFeatureAppDefinition.error);

      if (!inBrowser) {
        throw asyncFeatureAppDefinition.error;
      }

      this.state = {hasError: true};
    } else if (asyncFeatureAppDefinition.value) {
      this.state = {featureAppDefinition: asyncFeatureAppDefinition.value};
    } else if (!inBrowser && asyncSsrManager) {
      asyncSsrManager.scheduleRerender(asyncFeatureAppDefinition.promise);
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
    } catch (error) {
      this.reportError(error);

      if (this.mounted) {
        this.setState({hasError: true});
      }
    }
  }

  public componentWillUnmount(): void {
    this.mounted = false;
  }

  public render(): React.ReactNode {
    const {idSpecifier, instanceConfig} = this.props;
    const {featureAppDefinition, hasError} = this.state;

    if (hasError) {
      // An error UI could be rendered here.
      return null;
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

  private reportError(error: Error): void {
    if (this.errorReported) {
      return;
    }

    this.errorReported = true;

    const {idSpecifier, src: clientSrc, serverSrc} = this.props;
    const src = inBrowser ? clientSrc : serverSrc;

    this.props.logger.error(
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
