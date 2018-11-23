import {
  FeatureAppDefinition,
  FeatureAppManagerLike,
  FeatureAppScope
} from '@feature-hub/core';
import * as React from 'react';
import {isDomFeatureApp, isFeatureApp} from './internal/type-guards';

export interface DomFeatureApp {
  attachTo(container: Element): void;
}

export interface ReactFeatureApp {
  render(): React.ReactNode;
}

export type FeatureApp = DomFeatureApp | ReactFeatureApp;

export interface FeatureAppContainerProps {
  manager: FeatureAppManagerLike;
  featureAppDefinition: FeatureAppDefinition<unknown>;
  featureAppKey?: string;
}

// tslint:disable:strict-type-predicates
const inBrowser =
  typeof window === 'object' &&
  typeof document === 'object' &&
  document.nodeType === 9;
// tslint:enable:strict-type-predicates

export class FeatureAppContainer extends React.PureComponent<
  FeatureAppContainerProps
> {
  private readonly featureAppScope?: FeatureAppScope<unknown>;
  private readonly featureApp?: FeatureApp;
  private readonly containerRef = React.createRef<HTMLDivElement>();

  public constructor(props: FeatureAppContainerProps) {
    super(props);

    const {manager, featureAppDefinition, featureAppKey} = props;

    try {
      this.featureAppScope = manager.getFeatureAppScope(
        featureAppDefinition,
        featureAppKey
      );

      if (!isFeatureApp(this.featureAppScope.featureApp)) {
        throw new Error(
          'Invalid feature app found. The feature app must be an object with either 1) a `render` method that returns a react element, or 2) an `attachTo` method that accepts a container DOM element.'
        );
      }

      this.featureApp = this.featureAppScope.featureApp;
    } catch (error) {
      console.error(error);

      if (!inBrowser) {
        // TODO: we should only throw for "mission critical" feature apps ...
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
