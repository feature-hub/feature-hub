import {
  FeatureAppDefinition,
  FeatureAppScope,
  FeatureServices
} from '@feature-hub/core';
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
 * A Feature App that can be rendered by the [[FeatureAppLoader]] or
 * [[FeatureAppContainer]] must be either a [[ReactFeatureApp]]
 * (recommended) or a [[DomFeatureApp]].
 */
export type FeatureApp = ReactFeatureApp | DomFeatureApp;

export interface FeatureAppContainerProps {
  /**
   * The absolute or relative base URL of the Feature App's assets and/or BFF.
   */
  readonly baseUrl?: string;

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

  /**
   * A callback that is called before the Feature App is created.
   */
  readonly beforeCreate?: (
    featureAppUid: string,
    featureServices: FeatureServices
  ) => void;

  readonly onError?: (error: Error) => void;

  readonly renderError?: (error: Error) => React.ReactNode;
}

type InternalFeatureAppContainerProps = FeatureAppContainerProps &
  Pick<FeatureHubContextConsumerValue, 'featureAppManager' | 'logger'>;

type InternalFeatureAppContainerState =
  | {readonly featureAppError: Error}
  | {readonly featureApp: FeatureApp};

const inBrowser =
  typeof window === 'object' &&
  typeof document === 'object' &&
  document.nodeType === 9;

class InternalFeatureAppContainer extends React.PureComponent<
  InternalFeatureAppContainerProps,
  InternalFeatureAppContainerState
> {
  private readonly featureAppScope?: FeatureAppScope<unknown>;
  private readonly containerRef = React.createRef<HTMLDivElement>();

  public constructor(props: InternalFeatureAppContainerProps) {
    super(props);

    const {
      baseUrl,
      beforeCreate,
      featureAppManager,
      featureAppDefinition,
      idSpecifier,
      instanceConfig
    } = props;

    try {
      this.featureAppScope = featureAppManager.getFeatureAppScope(
        featureAppDefinition,
        {baseUrl, idSpecifier, instanceConfig, beforeCreate}
      );

      if (!isFeatureApp(this.featureAppScope.featureApp)) {
        throw new Error(
          'Invalid Feature App found. The Feature App must be an object with either 1) a `render` method that returns a React element, or 2) an `attachTo` method that accepts a container DOM element.'
        );
      }

      this.state = {featureApp: this.featureAppScope.featureApp};
    } catch (error) {
      this.handleError(error);

      this.state = {featureAppError: error};
    }
  }

  public componentDidCatch(error: Error): void {
    this.handleError(error);

    this.setState({featureAppError: error});
  }

  public componentDidMount(): void {
    const container = this.containerRef.current;

    if (
      container &&
      'featureApp' in this.state &&
      isDomFeatureApp(this.state.featureApp)
    ) {
      try {
        this.state.featureApp.attachTo(container);
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
        this.handleError(error);
      }
    }
  }

  public render(): React.ReactNode {
    if ('featureAppError' in this.state) {
      return this.renderError(this.state.featureAppError);
    }

    if (isDomFeatureApp(this.state.featureApp)) {
      return <div ref={this.containerRef} />;
    }

    try {
      return this.state.featureApp.render();
    } catch (error) {
      this.handleError(error);

      return this.renderError(error);
    }
  }

  private renderError(error: Error): React.ReactNode {
    return this.props.renderError ? this.props.renderError(error) : null;
  }

  private handleError(error: Error): void {
    const {logger, onError} = this.props;

    if (onError) {
      onError(error);
    } else {
      logger.error(error);

      /**
       * @deprecated Should be handled instead by providing onError that throws.
       * Remove this legacy branch for version 2.0 of @feature-hub/react.
       */
      if (!inBrowser) {
        throw error;
      }
    }
  }
}

/**
 * The `FeatureAppContainer` component allows the integrator to bundle Feature
 * Apps instead of loading them from a remote location. It can also be used by
 * a Feature App to render another Feature App as a child.
 *
 * When a Feature App throws an error while rendering or, in the case of a
 * [[ReactFeatureApp]], throws an error in a lifecycle method, the
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
