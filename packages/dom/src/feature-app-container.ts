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

export function createFeatureAppContainer(
  manager: FeatureAppManager
): typeof HTMLElement {
  class FeatureAppContainer extends LitElement {
    @property({type: Object})
    public featureAppDefinition?: FeatureAppDefinition<DomFeatureApp>;

    @property({type: String})
    public idSpecifier?: string;

    private featureAppScope: FeatureAppScope<DomFeatureApp> | undefined;

    public render(): TemplateResult {
      return html`
        ${this.getFeatureApp()}
      `;
    }

    public disconnectedCallback(): void {
      if (this.featureAppScope) {
        this.featureAppScope.destroy();
      }

      super.disconnectedCallback();
    }

    private getFeatureApp(): HTMLElement | TemplateResult {
      try {
        const element = document.createElement('div');

        if (!this.featureAppDefinition) {
          return element;
        }

        this.featureAppScope = manager.getFeatureAppScope(
          this.featureAppDefinition,
          {idSpecifier: this.idSpecifier}
        );

        this.featureAppScope.featureApp.attachTo(element);

        return element;
      } catch (error) {
        console.error(error);

        return html`
          <slot name="error"></slot>
        `;
      }
    }
  }

  customElements.define('feature-app-container', FeatureAppContainer);

  return FeatureAppContainer;
}
