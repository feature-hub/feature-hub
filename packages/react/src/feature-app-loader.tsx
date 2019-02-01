import {FeatureAppDefinition} from '@feature-hub/core';
import * as React from 'react';
import {FeatureAppContainer} from './feature-app-container';
import {
  FeatureHubContextConsumer,
  FeatureHubContextValue
} from './feature-hub-context';

export interface Css {
  readonly href: string;
  readonly media?: string;
}

export interface FeatureAppLoaderProps {
  /**
   * The URL of the Feature App's browser module bundle.
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
}

type InternalFeatureAppLoaderProps = FeatureAppLoaderProps &
  FeatureHubContextValue;

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
      asyncSsrManager.rerenderAfter(asyncFeatureAppDefinition.promise);
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
        idSpecifier={this.props.idSpecifier}
      />
    );
  }

  private appendCss(): void {
    if (!this.props.css) {
      return;
    }

    for (const {href, media} of this.props.css) {
      if (!document.querySelector(`link[href="${href}"]`) && document.head) {
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

    console.error(
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
 */
export function FeatureAppLoader(props: FeatureAppLoaderProps): JSX.Element {
  return (
    <FeatureHubContextConsumer>
      {({featureAppManager, asyncSsrManager, addUrlForHydration}) => (
        <InternalFeatureAppLoader
          featureAppManager={featureAppManager}
          asyncSsrManager={asyncSsrManager}
          addUrlForHydration={addUrlForHydration}
          {...props}
        />
      )}
    </FeatureHubContextConsumer>
  );
}
