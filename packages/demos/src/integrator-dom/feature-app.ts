import {FeatureAppDefinition} from '@feature-hub/core';
import {DomFeatureApp} from '@feature-hub/dom';

const featureAppDefinition: FeatureAppDefinition<DomFeatureApp> = {
  id: 'test:hello-world',

  create: () => ({
    attachTo(element: HTMLElement): void {
      element.replaceWith('Hello, World!');
    }
  })
};

export default featureAppDefinition;
