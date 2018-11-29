import {FeatureAppDefinition, FeatureAppManagerLike} from '@feature-hub/core';
import * as React from 'react';
import {FeatureAppContainer} from './feature-app-container';

export interface Css {
  readonly href: string;
  readonly media?: string;
}

export interface FeatureAppLoaderProps {
  readonly manager: FeatureAppManagerLike;
  readonly src: string;
  readonly nodeSrc?: string;
  readonly css?: Css[];
  readonly featureAppKey?: string;
}

interface FeatureAppLoaderState {
  readonly featureAppDefinition?: FeatureAppDefinition<unknown>;
  readonly loadingError?: boolean;
}

// tslint:disable:strict-type-predicates
const inBrowser =
  typeof window === 'object' &&
  typeof document === 'object' &&
  document.nodeType === 9;
// tslint:enable:strict-type-predicates

export class FeatureAppLoader extends React.PureComponent<
  FeatureAppLoaderProps,
  FeatureAppLoaderState
> {
  public readonly state: FeatureAppLoaderState = {};

  private mounted = false;
  private loggedLoadingError = false;

  public constructor(props: FeatureAppLoaderProps) {
    super(props);

    const {manager, src: browserSrc, nodeSrc} = props;
    const src = inBrowser ? browserSrc : nodeSrc;

    if (!src) {
      return;
    }

    const asyncFeatureAppDefinition = manager.getAsyncFeatureAppDefinition(src);

    if (asyncFeatureAppDefinition.error) {
      this.logLoadingError(asyncFeatureAppDefinition.error);

      if (!inBrowser) {
        // TODO: we should only throw for "mission critical" feature apps ...
        throw asyncFeatureAppDefinition.error;
      }

      this.state = {loadingError: true};
    } else {
      this.state = {featureAppDefinition: asyncFeatureAppDefinition.value};
    }
  }

  public async componentDidMount(): Promise<void> {
    this.mounted = true;

    this.appendCss();

    if (this.state.featureAppDefinition) {
      return;
    }

    const {manager, src} = this.props;
    const asyncFeatureAppDefinition = manager.getAsyncFeatureAppDefinition(src);

    try {
      const featureAppDefinition = await asyncFeatureAppDefinition.promise;

      if (this.mounted) {
        this.setState({featureAppDefinition});
      }
    } catch (error) {
      this.logLoadingError(error);

      if (this.mounted) {
        this.setState({loadingError: true});
      }
    }
  }

  public componentWillUnmount(): void {
    this.mounted = false;
  }

  public render(): React.ReactNode {
    const {featureAppDefinition, loadingError} = this.state;
    const {manager, featureAppKey} = this.props;

    if (loadingError) {
      // An error UI could be rendered here.
      return null;
    }

    if (!featureAppDefinition) {
      // A loading UI could be rendered here.
      return null;
    }

    return (
      <FeatureAppContainer
        manager={manager}
        featureAppDefinition={featureAppDefinition}
        featureAppKey={featureAppKey}
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

  private logLoadingError(error: Error): void {
    if (this.loggedLoadingError) {
      return;
    }

    this.loggedLoadingError = true;

    const {featureAppKey, src: browserSrc, nodeSrc} = this.props;
    const src = inBrowser ? browserSrc : nodeSrc;

    console.error(
      `The feature app for the url ${JSON.stringify(
        src
      )} and the key ${JSON.stringify(featureAppKey)} could not be loaded.`,
      error
    );
  }
}
