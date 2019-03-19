import {FeatureAppManager, Logger} from '@feature-hub/core';
import {LitElement, html, property} from 'lit-element';
import {TemplateResult} from 'lit-html';
import {ifDefined} from 'lit-html/directives/if-defined';
import {until} from 'lit-html/directives/until';
import {defineFeatureAppContainer} from './feature-app-container';

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
   * A URL pointing to a Feature App's module bundle.
   */
  src: string;

  /**
   * If multiple instances of the same Feature App are placed on a single web
   * page, an `idSpecifier` that is unique for the Feature App ID must be
   * defined.
   */
  idSpecifier?: string;

  /**
   * A config object that is intended for the specific Feature App instance that
   * the `feature-app-loader` loads.
   */
  instanceConfig?: unknown;
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
    public src!: string;

    @property({type: String})
    public idSpecifier?: string;

    @property({type: Object})
    public instanceConfig?: unknown;

    public render(): TemplateResult {
      return html`
        ${until(
          this.loadFeatureApp(),
          html`
            <slot name="loading"></slot>
          `
        )}
      `;
    }

    private async loadFeatureApp(): Promise<TemplateResult> {
      try {
        if (!this.src) {
          throw new Error('No src provided.');
        }

        const definition = await featureAppManager.getAsyncFeatureAppDefinition(
          this.src
        ).promise;

        return html`
          <feature-app-container
            idSpecifier=${ifDefined(this.idSpecifier)}
            .featureAppDefinition=${definition}
            .instanceConfig=${this.instanceConfig}
          >
            <slot name="error" slot="error"></slot>
          </feature-app-container>
        `;
      } catch (error) {
        logger.error(error);

        return html`
          <slot name="error"></slot>
        `;
      }
    }
  }

  customElements.define(elementName, FeatureAppLoader);
}
