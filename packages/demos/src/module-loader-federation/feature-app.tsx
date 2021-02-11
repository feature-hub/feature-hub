import {FeatureAppDefinition} from '@feature-hub/core';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';

const featureAppDefinition: FeatureAppDefinition<ReactFeatureApp> = {
  dependencies: {
    externals: {},
  },

  create: () => ({
    render: () => (
      <h3 style={{margin: '20px'}}>
        <span>Hello, World!</span>
      </h3>
    ),
  }),
};

export default featureAppDefinition;
