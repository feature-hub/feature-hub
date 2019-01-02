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
  readonly idSpecifier?: string;
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

    const {manager, src: browserSrc, nodeSrc} = props;
    const src = inBrowser ? browserSrc : nodeSrc;

    if (!src) {
      if (inBrowser) {
        throw new Error('No src provided.');
      }

      return;
    }

    const asyncFeatureAppDefinition = manager.getAsyncFeatureAppDefinition(src);

    if (asyncFeatureAppDefinition.error) {
      this.reportError(asyncFeatureAppDefinition.error);

      if (!inBrowser) {
        // TODO: we should only throw for "mission critical" feature apps ...
        throw asyncFeatureAppDefinition.error;
      }

      this.state = {hasError: true};
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
    const {manager, idSpecifier} = this.props;

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
        manager={manager}
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

    const {idSpecifier, src: browserSrc, nodeSrc} = this.props;
    const src = inBrowser ? browserSrc : nodeSrc;

    console.error(
      idSpecifier
        ? `The feature app for the src ${JSON.stringify(
            src
          )} and the ID specifier ${JSON.stringify(
            idSpecifier
          )} could not be rendered.`
        : `The feature app for the src ${JSON.stringify(
            src
          )} could not be rendered.`,
      error
    );
  }
}
