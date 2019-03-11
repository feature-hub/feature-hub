import {FeatureAppDefinition, FeatureAppScope} from '@feature-hub/core';
import * as React from 'react';
import {
  FeatureHubContextConsumer,
  FeatureHubContextConsumerValue
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

  /**
   * A config object that is intended for the specific Feature App instance that
   * the `FeatureAppContainer` renders.
   */
  readonly instanceConfig?: unknown;
}

type InternalFeatureAppContainerProps = FeatureAppContainerProps &
  Pick<FeatureHubContextConsumerValue, 'featureAppManager' | 'logger'>;

interface InternalFeatureAppContainerState {
  /**
   * Will be set to true if a DOM Feature App throws in #attachTo or if the
   * error boundary catches an error thrown by a React Feature app in a
   * lifecycle method. Since DOM Feature Apps aren't server-side-rendered and
   * error boundaries only work on the client, this flag will only ever be true
   * on the client.
   */
  hasFeatureAppError: boolean;
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
    hasFeatureAppError: false
  };

  private readonly featureAppScope?: FeatureAppScope<unknown>;
  private readonly featureApp?: FeatureApp;
  private readonly containerRef = React.createRef<HTMLDivElement>();

  public constructor(props: InternalFeatureAppContainerProps) {
    super(props);

    const {
      featureAppManager,
      featureAppDefinition,
      idSpecifier,
      instanceConfig,
      logger
    } = props;

    try {
      this.featureAppScope = featureAppManager.getFeatureAppScope(
        featureAppDefinition,
        {idSpecifier, instanceConfig}
      );

      if (!isFeatureApp(this.featureAppScope.featureApp)) {
        throw new Error(
          'Invalid Feature App found. The Feature App must be an object with either 1) a `render` method that returns a React element, or 2) an `attachTo` method that accepts a container DOM element.'
        );
      }

      this.featureApp = this.featureAppScope.featureApp;
    } catch (error) {
      logger.error(error);

      if (!inBrowser) {
        throw error;
      }
    }
  }

  public componentDidCatch(error: Error): void {
    this.setState({hasFeatureAppError: true});
    this.props.logger.error(error);
  }

  public componentDidMount(): void {
    const container = this.containerRef.current;

    if (container && this.featureApp && isDomFeatureApp(this.featureApp)) {
      try {
        this.featureApp.attachTo(container);
      } catch (error) {
        this.componentDidCatch(error);
      }
    }
  }

  public componentWillUnmount(): void {
    if (this.featureAppScope) {
      try {
        this.featureAppScope.destroy();
      } catch (error) {
        this.props.logger.error(error);
      }
    }
  }

  public render(): React.ReactNode {
    if (!this.featureApp || this.state.hasFeatureAppError) {
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

      this.props.logger.error(error);

      return null;
    }
  }
}

/**
 * The `FeatureAppContainer` component allows the integrator to bundle Feature
 * Apps instead of loading them from a remote location. It can also be used by
 * a Feature App to render another Feature App as a child.
 *
 * When a Feature App throws an error while rendering or, in the case of a
 * {@link ReactFeatureApp}, throws an error in a lifecycle method, the
 * `FeatureAppContainer` renders `null`. On the server, however, rendering
 * errors are not caught and must therefore be handled by the integrator.
 */
export function FeatureAppContainer(
  props: FeatureAppContainerProps
): JSX.Element {
  return (
    <FeatureHubContextConsumer>
      {({featureAppManager, logger}) => (
        <InternalFeatureAppContainer
          featureAppManager={featureAppManager}
          logger={logger}
          {...props}
        />
      )}
    </FeatureHubContextConsumer>
  );
}
