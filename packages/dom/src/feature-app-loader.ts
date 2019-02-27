import {FeatureAppManager} from '@feature-hub/core';
import {LitElement, html, property} from 'lit-element';
import {TemplateResult} from 'lit-html';
import {until} from 'lit-html/directives/until';
import {defineFeatureAppContainer} from './feature-app-container';

const elementName = 'feature-app-loader';

/**
 * Define a custom element named `feature-app-loader` at the
 * `CustomElementRegistry`.
 *
 * The defined element has two attributes, a `src` attribute which needs to
 * contain a URL pointing to a Feature App's module bundle and an optional
 * `idSpecifier` attribute which needs to be defined if multiple instances of
 * the same Feature App are placed on a single web page.
 *
 * It is possible to pass two slots to the `feature-app-loader` element. One
 * slot named `loading` is rendered while the Feature App module is loading.
 * The other one named `error` is rendered if the Feature App module could not
 * be loaded and is also passed to the underlying `feature-app-container`
 * element (@see {@link defineFeatureAppContainer}).
 */
export function defineFeatureAppLoader(
  featureAppManager: FeatureAppManager
): void {
  if (customElements.get(elementName)) {
    return;
  }

  defineFeatureAppContainer(featureAppManager);

  class FeatureAppLoader extends LitElement {
    @property({type: String})
    public src!: string;

    @property({type: String})
    public idSpecifier: string | undefined;

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
            idSpecifier=${this.idSpecifier}
            .featureAppDefinition=${definition}
          >
            <slot name="error" slot="error"></slot>
          </feature-app-container>
        `;
      } catch (error) {
        console.error(error);

        return html`
          <slot name="error"></slot>
        `;
      }
    }
  }

  customElements.define(elementName, FeatureAppLoader);
}
