import {
  FeatureAppDefinition,
  FeatureAppManagerLike,
  FeatureAppScope
} from '@feature-hub/core';
import * as React from 'react';
import {FeatureApp} from '../feature-app-container';
import {isDomFeatureApp, isFeatureApp} from './type-guards';

export interface InternalFeatureAppContainerProps {
  readonly featureAppManager: FeatureAppManagerLike;
  readonly featureAppDefinition: FeatureAppDefinition<unknown>;
  readonly idSpecifier?: string;
}

const inBrowser =
  typeof window === 'object' &&
  typeof document === 'object' &&
  document.nodeType === 9;

export class InternalFeatureAppContainer extends React.PureComponent<
  InternalFeatureAppContainerProps
> {
  private readonly featureAppScope?: FeatureAppScope<unknown>;
  private readonly featureApp?: FeatureApp;
  private readonly containerRef = React.createRef<HTMLDivElement>();

  public constructor(props: InternalFeatureAppContainerProps) {
    super(props);

    const {featureAppManager, featureAppDefinition, idSpecifier} = props;

    try {
      this.featureAppScope = featureAppManager.getFeatureAppScope(
        featureAppDefinition,
        idSpecifier
      );

      if (!isFeatureApp(this.featureAppScope.featureApp)) {
        throw new Error(
          'Invalid Feature App found. The Feature App must be an object with either 1) a `render` method that returns a React element, or 2) an `attachTo` method that accepts a container DOM element.'
        );
      }

      this.featureApp = this.featureAppScope.featureApp;
    } catch (error) {
      console.error(error);

      if (!inBrowser) {
        throw error;
      }
    }
  }

  public componentDidMount(): void {
    const container = this.containerRef.current;

    if (container && this.featureApp && isDomFeatureApp(this.featureApp)) {
      this.featureApp.attachTo(container);
    }
  }

  public componentWillUnmount(): void {
    if (this.featureAppScope) {
      try {
        this.featureAppScope.destroy();
      } catch (error) {
        console.error(error);
      }
    }
  }

  public render(): React.ReactNode {
    if (!this.featureApp) {
      return null;
    }

    if (isDomFeatureApp(this.featureApp)) {
      return <div ref={this.containerRef} />;
    }

    return this.featureApp.render();
  }
}
