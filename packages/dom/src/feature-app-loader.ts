import {FeatureAppManager} from '@feature-hub/core';
import {LitElement, html, property} from 'lit-element';
import {TemplateResult} from 'lit-html';
import {until} from 'lit-html/directives/until';
import {createFeatureAppContainer} from './feature-app-container';

export function createFeatureAppLoader(
  manager: FeatureAppManager
): typeof HTMLElement {
  createFeatureAppContainer(manager);

  class FeatureAppLoader extends LitElement {
    @property({type: String})
    public src = '';

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
        const definition = await manager.getAsyncFeatureAppDefinition(this.src)
          .promise;

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

  customElements.define('feature-app-loader', FeatureAppLoader);

  return FeatureAppLoader;
}
