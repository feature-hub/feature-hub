import type {FeatureAppDefinition} from '@feature-hub/core';
import type {DetachFunction, DomFeatureApp} from '@feature-hub/dom';

const featureAppDefinition: FeatureAppDefinition<DomFeatureApp> = {
  create: () => ({
    attachTo(element: HTMLElement): DetachFunction {
      element.replaceWith('Hello, World!');

      return () => {
        document.title = 'Detached!';
      };
    },
  }),
};

export default featureAppDefinition;
