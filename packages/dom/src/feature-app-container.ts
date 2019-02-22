import {
  FeatureAppDefinition,
  FeatureAppManager,
  FeatureAppScope
} from '@feature-hub/core';
import {LitElement, html, property} from 'lit-element';
import {TemplateResult} from 'lit-html';

/**
 * A DOM Feature App allows the use of any frontend technology such as Vue.js,
 * React, or Angular.
 */
export interface DomFeatureApp {
  /**
   * @param container The container element to which the Feature App can attach
   * itself.
   */
  attachTo(container: Element): void;
}

export function defineFeatureAppContainer(
  featureAppManager: FeatureAppManager
): void {
  class FeatureAppContainer extends LitElement {
    @property({type: Object})
    public featureAppDefinition?: FeatureAppDefinition<DomFeatureApp>;

    @property({type: String})
    public idSpecifier?: string;

    private featureAppScope: FeatureAppScope<DomFeatureApp> | undefined;

    public render(): TemplateResult {
      try {
        const element = document.createElement('div');

        if (!this.featureAppDefinition) {
          return html`
            ${element}
          `;
        }

        this.featureAppScope = featureAppManager.getFeatureAppScope(
          this.featureAppDefinition,
          {idSpecifier: this.idSpecifier}
        );

        this.featureAppScope.featureApp.attachTo(element);

        return html`
          ${element}
        `;
      } catch (error) {
        console.error(error);

        return html`
          <slot name="error"></slot>
        `;
      }
    }

    public disconnectedCallback(): void {
      if (this.featureAppScope) {
        this.featureAppScope.destroy();
      }

      super.disconnectedCallback();
    }
  }

  customElements.define('feature-app-container', FeatureAppContainer);
}
