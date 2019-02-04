import {FeatureAppDefinition} from '@feature-hub/core';
import {DomFeatureApp} from '@feature-hub/dom';

export default {
  id: 'test:hello-world',

  create: () => ({
    attachTo(element: HTMLElement): void {
      element.innerHTML = 'Hello, World!';
    }
  })
} as FeatureAppDefinition<DomFeatureApp>;
