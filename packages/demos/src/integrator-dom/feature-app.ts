import {FeatureAppDefinition} from '@feature-hub/core';
import {DomFeatureApp} from '@feature-hub/dom';

const featureAppDefinition: FeatureAppDefinition<DomFeatureApp> = {
  create: () => ({
    attachTo(element: HTMLElement): void {
      element.replaceWith('Hello, World!');
    },
  }),
};

export default featureAppDefinition;
