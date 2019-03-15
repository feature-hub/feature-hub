import {
  FeatureAppDefinition,
  FeatureAppManager,
  FeatureAppScope,
  Logger
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

export interface DefineFeatureAppContainerOptions {
  /**
   * A custom logger that shall be used instead of `console`.
   */
  readonly logger?: Logger;
}

/**
 * Define a custom element implementing the {@link FeatureAppContainerElement}
 * interface under the name `feature-app-container` at the
 * `CustomElementRegistry`.
 */
export function defineFeatureAppContainer(
  featureAppManager: FeatureAppManager,
  options: DefineFeatureAppContainerOptions = {}
): void {
  if (customElements.get(elementName)) {
    return;
  }

  const {logger = console} = options;

  class FeatureAppContainer extends LitElement
    implements FeatureAppContainerElement {
    @property({type: Object})
    public featureAppDefinition?: FeatureAppDefinition<DomFeatureApp>;

    @property({type: String})
    public idSpecifier?: string;

    @property({type: Object})
    public instanceConfig?: unknown;

    @property({type: Object, reflect: false})
    private error?: Error;

    private featureAppScope: FeatureAppScope<DomFeatureApp> | undefined;

    private readonly appElement = document.createElement('div');

    public firstUpdated(): void {
      if (!this.featureAppDefinition) {
        return;
      }

      try {
        this.featureAppScope = featureAppManager.getFeatureAppScope(
          this.featureAppDefinition,
          {idSpecifier: this.idSpecifier, instanceConfig: this.instanceConfig}
        );

        this.featureAppScope.featureApp.attachTo(this.appElement);
      } catch (error) {
        logger.error(error);

        this.error = error;
      }
    }

    public render(): TemplateResult {
      if (this.error) {
        return html`
          <slot name="error"></slot>
        `;
      }

      return html`
        ${this.appElement}
      `;
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
