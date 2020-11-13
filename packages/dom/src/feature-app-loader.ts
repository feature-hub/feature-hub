import {FeatureAppManager, Logger} from '@feature-hub/core';
import {LitElement, html, property} from 'lit-element';
import {TemplateResult} from 'lit-html';
import {ifDefined} from 'lit-html/directives/if-defined';
import {until} from 'lit-html/directives/until';
import {defineFeatureAppContainer} from './feature-app-container';
import {prependBaseUrl} from './internal/prepend-base-url';

const elementName = 'feature-app-loader';

/**
 * A custom element defined by [[defineFeatureAppLoader]] as
 * `feature-app-loader`.
 *
 * It is possible to pass two slots to the `feature-app-loader` element. One
 * slot named `loading` is rendered while the Feature App module is loading.
 * The other one named `error` is rendered if the Feature App module could not
 * be loaded and is also passed to the underlying `feature-app-container`
 * element (@see [[FeatureAppContainerElement]]).
 */
export interface FeatureAppLoaderElement extends HTMLElement {
  /**
   * The Feature App ID is used to identify the Feature App instance. Multiple
   * Feature App Loaders with the same `featureAppId` will render the same
   * Feature app instance. The ID is also used as a consumer ID for dependent
   * Feature Services. To render multiple instances of the same kind of Feature
   * App, different IDs must be used.
   */
  featureAppId: string;

  /**
   * The Feature App's name. In contrast to the `featureAppId`, the name must
   * not be unique. It can be used by required Feature Services for display
   * purposes, logging, looking up Feature App configuration meta data, etc.
   */
  featureAppName?: string;

  /**
   * The absolute or relative base URL of the Feature App's assets and/or BFF.
   */
  baseUrl?: string;

  /**
   * The URL of the Feature App's module bundle. If [[baseUrl]] is specified, it
   * will be prepended, unless `src` is an absolute URL.
   */
  src: string;

  /**
   * A config object that is passed to the Feature App's `create` method.
   */
  config?: unknown;
}

export interface DefineFeatureAppLoaderOptions {
  /**
   * A custom logger that shall be used instead of `console`.
   */
  readonly logger?: Logger;
}

/**
 * Define a custom element implementing the [[FeatureAppLoaderElement]]
 * interface under the name `feature-app-loader` at the
 * `CustomElementRegistry`.
 */
export function defineFeatureAppLoader(
  featureAppManager: FeatureAppManager,
  options: DefineFeatureAppLoaderOptions = {}
): void {
  if (customElements.get(elementName)) {
    return;
  }

  const {logger = console} = options;

  defineFeatureAppContainer(featureAppManager, options);

  class FeatureAppLoader extends LitElement implements FeatureAppLoaderElement {
    @property({type: String})
    public featureAppId!: string;

    @property({type: String})
    public featureAppName?: string;

    @property({type: String})
    public baseUrl?: string;

    @property({type: String})
    public src!: string;

    @property({type: Object})
    public config?: unknown;

    public render(): TemplateResult {
      return html`
        ${until(this.loadFeatureApp(), html` <slot name="loading"></slot> `)}
      `;
    }

    private async loadFeatureApp(): Promise<TemplateResult> {
      try {
        if (!this.src) {
          throw new Error('No src provided.');
        }

        const definition = await featureAppManager.getAsyncFeatureAppDefinition(
          prependBaseUrl(this.baseUrl, this.src)
        ).promise;

        return html`
          <feature-app-container
            featureAppId=${this.featureAppId}
            featureAppName=${ifDefined(this.featureAppName)}
            baseUrl=${ifDefined(this.baseUrl)}
            .featureAppDefinition=${definition}
            .config=${this.config}
          >
            <slot name="error" slot="error"></slot>
          </feature-app-container>
        `;
      } catch (error) {
        logger.error(error);

        return html` <slot name="error"></slot> `;
      }
    }
  }

  customElements.define(elementName, FeatureAppLoader);
}
