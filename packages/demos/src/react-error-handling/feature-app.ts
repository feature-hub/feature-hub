import {FeatureAppDefinition} from '@feature-hub/core';
import {ReactFeatureApp} from '@feature-hub/react';

const featureAppDefinition: FeatureAppDefinition<ReactFeatureApp> = {
  // tslint:disable-next-line:no-any intentionally invalid create function
  create: () => ({} as any)
};

export default featureAppDefinition;
