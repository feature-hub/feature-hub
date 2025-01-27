import {FeatureAppDefinition} from '@feature-hub/core';
import {DetachFunction, DomFeatureApp} from '@feature-hub/dom';

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
