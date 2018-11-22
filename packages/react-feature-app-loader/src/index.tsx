import {
  AsyncValue,
  FeatureAppDefinition,
  FeatureAppManagerLike
} from '@feature-hub/feature-app-manager';
import {FeatureAppContainer} from '@feature-hub/react-feature-app-container';
import * as React from 'react';

export interface Css {
  href: string;
  media?: string;
}

export interface FeatureAppLoaderProps {
  manager: FeatureAppManagerLike;
  src: string;
  css?: Css[];
  featureAppKey?: string;
}

interface FeatureAppLoaderState {
  featureAppDefinition?: FeatureAppDefinition<unknown>;
  loadingError?: boolean;
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
  public readonly state: FeatureAppLoaderState;

  private mounted = false;
  private loggedLoadingError = false;

  private readonly asyncFeatureAppDefinition: AsyncValue<
    FeatureAppDefinition<unknown>
  >;

  public constructor(props: FeatureAppLoaderProps) {
    super(props);

    const {manager, src} = props;

    this.asyncFeatureAppDefinition = manager.getAsyncFeatureAppDefinition(src);

    if (this.asyncFeatureAppDefinition.error) {
      this.logLoadingError(this.asyncFeatureAppDefinition.error);

      if (!inBrowser) {
        // TODO: we should only throw for "mission critical" feature apps ...
        throw this.asyncFeatureAppDefinition.error;
      }

      this.state = {loadingError: true};
    } else {
      this.state = {featureAppDefinition: this.asyncFeatureAppDefinition.value};
    }
  }

  public async componentDidMount(): Promise<void> {
    this.mounted = true;

    this.appendCss();

    if (!this.state.featureAppDefinition) {
      try {
        const featureAppDefinition = await this.asyncFeatureAppDefinition
          .promise;

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

    const {featureAppKey, src} = this.props;

    console.error(
      `The feature app for the url ${JSON.stringify(
        src
      )} and the key ${JSON.stringify(featureAppKey)} could not be loaded.`,
      error
    );
  }
}
