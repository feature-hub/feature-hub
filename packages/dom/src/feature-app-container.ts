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

/**
 * A custom element defined by {@link defineFeatureAppContainer} as
 * `feature-app-container`.
 *
 * It is possible to pass a slot named `error` to the `feature-app-container`
 * element which is rendered if the Feature App could not be created or if the
 * Feature App throws in its {@link DomFeatureApp.attachTo} method.
 */
export interface FeatureAppContainerElement extends HTMLElement {
  /**
   * The definition of the Feature App that should be rendered.
   */
  featureAppDefinition?: FeatureAppDefinition<DomFeatureApp>;

  /**
   * If multiple instances of the same Feature App are placed on a single web
   * page, an `idSpecifier` that is unique for the Feature App ID must be
   * defined.
   */
  idSpecifier?: string;

  /**
   * A config object that is intended for the specific Feature App instance
   * that the `feature-app-container` renders.
   */
  instanceConfig?: unknown;
}

const elementName = 'feature-app-container';

/**
 * Define a custom element implementing the {@link FeatureAppContainerElement}
 * interface under the name `feature-app-container` at the
 * `CustomElementRegistry`.
 */
export function defineFeatureAppContainer(
  featureAppManager: FeatureAppManager
): void {
  if (customElements.get(elementName)) {
    return;
  }

  class FeatureAppContainer extends LitElement
    implements FeatureAppContainerElement {
    @property({type: Object})
    public featureAppDefinition?: FeatureAppDefinition<DomFeatureApp>;

    @property({type: String})
    public idSpecifier?: string;

    @property({type: Object})
    public instanceConfig?: unknown;

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
          {idSpecifier: this.idSpecifier, instanceConfig: this.instanceConfig}
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

  customElements.define(elementName, FeatureAppContainer);
}
