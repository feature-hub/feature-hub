import {FeatureAppDefinition} from '@feature-hub/core';
import {ReactFeatureApp} from '@feature-hub/react';

const featureAppDefinition: FeatureAppDefinition<ReactFeatureApp> = {
  id: 'test:invalid',

  // tslint:disable-next-line:no-any intentionally invalid create function
  create: () => ({} as any)
};

export default featureAppDefinition;
