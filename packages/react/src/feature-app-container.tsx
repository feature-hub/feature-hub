import {FeatureAppDefinition, FeatureServices} from '@feature-hub/core';
import * as React from 'react';
import {FeatureHubContextConsumer} from './feature-hub-context';
import {
  BaseFeatureAppContainerProps,
  InternalFeatureAppContainer,
} from './internal/internal-feature-app-container';

export interface BaseFeatureApp {
  /**
   * Client-side only: A Feature App can define a promise that is resolved when
   * it is ready to render its content, e.g. after fetching required data
   * first. If the integrator has defined a loading UI, it will be rendered
   * until the promise is resolved.
   * For a similar behaviour during server-side rendering, one must handle this
   * using the async-ssr-manager.
   */
  readonly loadingPromise?: Promise<void>;
}

/**
 * The recommended way of writing a Feature App for a React integrator.
 */
export interface ReactFeatureApp extends BaseFeatureApp {
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
export interface DomFeatureApp extends BaseFeatureApp {
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

export interface CustomFeatureAppRenderingParams {
  /**
   * The Feature App node is a rendered React node, that can be inserted into
   * the react tree.
   *
   * **Caution!** If `featureAppNode` is defined it has to be rendered, even
   * when `loading=true`. A Feature App might depend on being rendered before
   * resolving its loading promise.
   *
   * **Caution!** The Feature App node should always be rendered into the same
   * position of the tree. Otherwise React can re-mount the Feature App, which
   * is resource-expensive and can break DOM Feature Apps.
   */
  featureAppNode?: React.ReactNode;

  /**
   * The Error can be used to render a custom error UI. If there is an error,
   * the Feature App will stop rendering and `featureAppNode` is `undefined`.
   */
  error?: unknown;

  /**
   * The loading boolean indicates if the Feature App is still loading, and can
   * be used to render a custom loading UI.
   *
   * **Caution!** If `featureAppNode` is defined it has to be rendered, even
   * when `loading=true`. A Feature App might depend on being rendered before
   * resolving its loading promise.
   *
   * To not show the Feature App in favour of a loading UI, it must be hidden
   * visually (e.g. via `display: none;`).
   */
  loading: boolean;
}

export interface FeatureAppContainerProps<
  TFeatureApp,
  TFeatureServices extends FeatureServices = FeatureServices,
  TConfig = unknown
> extends BaseFeatureAppContainerProps<TFeatureApp, TFeatureServices, TConfig> {
  /**
   * The consumer definition of the Feature App.
   */
  readonly featureAppDefinition: FeatureAppDefinition<
    TFeatureApp,
    TFeatureServices,
    TConfig
  >;
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
export function FeatureAppContainer<
  TFeatureApp extends FeatureApp,
  TFeatureServices extends FeatureServices = FeatureServices,
  TConfig = unknown
>(
  props: FeatureAppContainerProps<TFeatureApp, TFeatureServices, TConfig>
): JSX.Element {
  return (
    <FeatureHubContextConsumer>
      {({featureAppManager, logger}) => (
        <InternalFeatureAppContainer<TFeatureApp, TFeatureServices, TConfig>
          featureAppManager={featureAppManager}
          logger={logger}
          {...props}
        />
      )}
    </FeatureHubContextConsumer>
  );
}
