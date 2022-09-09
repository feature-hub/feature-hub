import {
  FeatureAppDefinition,
  FeatureAppManager,
  FeatureAppScope,
  Logger,
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
 * A custom element defined by [[defineFeatureAppContainer]] as
 * `feature-app-container`.
 *
 * It is possible to pass a slot named `error` to the `feature-app-container`
 * element which is rendered if the Feature App could not be created or if the
 * Feature App throws in its [[DomFeatureApp.attachTo]] method.
 */
export interface FeatureAppContainerElement extends HTMLElement {
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
   * The definition of the Feature App that should be rendered.
   */
  featureAppDefinition?: FeatureAppDefinition<DomFeatureApp>;

  /**
   * A config object that is passed to the Feature App's `create` method.
   */
  config?: unknown;
}

const elementName = 'feature-app-container';

export interface DefineFeatureAppContainerOptions {
  /**
   * A custom logger that shall be used instead of `console`.
   */
  readonly logger?: Logger;
}

/**
 * Define a custom element implementing the [[FeatureAppContainerElement]]
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

  class FeatureAppContainer
    extends LitElement
    implements FeatureAppContainerElement {
    @property({type: String})
    public featureAppId!: string;

    @property({type: String})
    public featureAppName?: string;

    @property({type: String})
    public baseUrl?: string;

    @property({type: Object})
    public featureAppDefinition?: FeatureAppDefinition<DomFeatureApp>;

    @property({type: Object})
    public config?: unknown;

    @property({type: Object, reflect: false})
    private error?: unknown;

    private featureAppScope: FeatureAppScope<DomFeatureApp> | undefined;

    private readonly appElement = document.createElement('div');

    public firstUpdated(): void {
      if (!this.featureAppDefinition) {
        return;
      }

      try {
        this.featureAppScope = featureAppManager.createFeatureAppScope(
          this.featureAppId,
          this.featureAppDefinition,
          {
            featureAppName: this.featureAppName,
            baseUrl: this.baseUrl,
            config: this.config,
          }
        );

        this.featureAppScope.featureApp.attachTo(this.appElement);
      } catch (error) {
        logger.error(error);

        this.error = error;
      }
    }

    public render(): TemplateResult {
      if (this.error) {
        return html` <slot name="error"></slot> `;
      }

      return html` ${this.appElement} `;
    }

    public disconnectedCallback(): void {
      if (this.featureAppScope) {
        this.featureAppScope.release();
      }

      super.disconnectedCallback();
    }
  }

  customElements.define(elementName, FeatureAppContainer);
}
