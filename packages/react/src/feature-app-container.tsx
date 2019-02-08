import {FeatureAppDefinition, FeatureAppScope} from '@feature-hub/core';
import * as React from 'react';
import {
  FeatureHubContextConsumer,
  FeatureHubContextValue
} from './feature-hub-context';
import {isDomFeatureApp, isFeatureApp} from './internal/type-guards';

/**
 * The recommended way of writing a Feature App for a React integrator.
 */
export interface ReactFeatureApp {
  /**
   * A React Feature App must define a `render` method that returns a React
   * element. Since this element is directly rendered by React, the standard
   * React lifecyle methods can be used (if `render` returns an instance of a
   * React `ComponentClass`).
   */
  render(): React.ReactNode;
}

/**
 * A DOM Feature App allows the use of other frontend technologies such as
 * Vue.js or Angular, although it is placed on a web page using React.
 */
export interface DomFeatureApp {
  /**
   * @param container The container element to which the Feature App can attach
   * itself.
   */
  attachTo(container: Element): void;
}

/**
 * A Feature App that can be rendered by the {@link FeatureAppLoader} or
 * {@link FeatureAppContainer} must be either a {@link ReactFeatureApp}
 * (recommended) or a {@link DomFeatureApp}.
 */
export type FeatureApp = ReactFeatureApp | DomFeatureApp;

export interface FeatureAppContainerProps {
  /**
   * The consumer definition of the Feature App.
   */
  readonly featureAppDefinition: FeatureAppDefinition<unknown>;

  /**
   * If multiple instances of the same Feature App are placed on a single web
   * page, an `idSpecifier` that is unique for the Feature App ID must be
   * defined.
   */
  readonly idSpecifier?: string;
}

type InternalFeatureAppContainerProps = FeatureAppContainerProps &
  FeatureHubContextValue;

interface InternalFeatureAppContainerState {
  hasError: boolean;
}

const inBrowser =
  typeof window === 'object' &&
  typeof document === 'object' &&
  document.nodeType === 9;

class InternalFeatureAppContainer extends React.PureComponent<
  InternalFeatureAppContainerProps,
  InternalFeatureAppContainerState
> {
  public readonly state: InternalFeatureAppContainerState = {
    hasError: false
  };

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

  public componentDidCatch(): void {
    this.setState({hasError: true});
  }

  public componentDidMount(): void {
    const container = this.containerRef.current;

    if (container && this.featureApp && isDomFeatureApp(this.featureApp)) {
      try {
        this.featureApp.attachTo(container);
      } catch (error) {
        console.error(error);
        this.setState({hasError: true});
      }
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
    if (!this.featureApp || this.state.hasError) {
      return null;
    }

    if (isDomFeatureApp(this.featureApp)) {
      return <div ref={this.containerRef} />;
    }

    try {
      return this.featureApp.render();
    } catch (error) {
      if (!inBrowser) {
        throw error;
      }

      console.error(error);

      return null;
    }
  }
}

/**
 * The `FeatureAppContainer` component allows the integrator to bundle Feature
 * Apps instead of loading them from a remote location. It can also be used by
 * a Feature App to render another Feature App as a child.
 *
 * If a Feature App throws an error while rendering or, in the case of a {@link
 * ReactFeatureApp}, in a lifecycle method, the `FeatureAppContainer` will
 * resort to rendering `null`. Except for on the server where rendering errors
 * won't be catched and therefore have to handled by the integrator.
 */
export function FeatureAppContainer(
  props: FeatureAppContainerProps
): JSX.Element {
  return (
    <FeatureHubContextConsumer>
      {({featureAppManager}) => (
        <InternalFeatureAppContainer
          featureAppManager={featureAppManager}
          {...props}
        />
      )}
    </FeatureHubContextConsumer>
  );
}
