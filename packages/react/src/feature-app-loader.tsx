import {AsyncSsrManagerV0} from '@feature-hub/async-ssr-manager';
import {FeatureAppDefinition, FeatureAppManagerLike} from '@feature-hub/core';
import * as React from 'react';
import {FeatureAppContainer} from './feature-app-container';

export interface Css {
  readonly href: string;
  readonly media?: string;
}

export interface FeatureAppLoaderProps {
  readonly featureAppManager: FeatureAppManagerLike;
  readonly src: string;
  readonly serverSrc?: string;
  readonly css?: Css[];
  readonly idSpecifier?: string;
  readonly asyncSsrManager?: AsyncSsrManagerV0;
}

interface FeatureAppLoaderState {
  readonly featureAppDefinition?: FeatureAppDefinition<unknown>;
  readonly hasError?: boolean;
}

const inBrowser =
  typeof window === 'object' &&
  typeof document === 'object' &&
  document.nodeType === 9;

export class FeatureAppLoader extends React.PureComponent<
  FeatureAppLoaderProps,
  FeatureAppLoaderState
> {
  public readonly state: FeatureAppLoaderState = {};

  private errorReported = false;
  private mounted = false;

  public constructor(props: FeatureAppLoaderProps) {
    super(props);

    const {
      featureAppManager,
      src: browserSrc,
      serverSrc,
      asyncSsrManager
    } = props;

    const src = inBrowser ? browserSrc : serverSrc;

    if (!src) {
      if (inBrowser) {
        throw new Error('No src provided.');
      }

      return;
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
    const {featureAppManager, idSpecifier} = this.props;

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
        featureAppManager={featureAppManager}
        featureAppDefinition={featureAppDefinition}
        idSpecifier={idSpecifier}
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

    const {idSpecifier, src: browserSrc, serverSrc} = this.props;
    const src = inBrowser ? browserSrc : serverSrc;

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
