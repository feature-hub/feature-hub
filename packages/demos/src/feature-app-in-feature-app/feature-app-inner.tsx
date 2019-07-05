import {Text} from '@blueprintjs/core';
import {FeatureAppDefinition} from '@feature-hub/core';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';

const featureAppDefinition: FeatureAppDefinition<ReactFeatureApp> = {
  dependencies: {
    externals: {
      react: '^16.7.0',
      '@feature-hub/react': '^2.0.0'
    }
  },

  create: () => ({
    render: () => <Text>Hello, World!</Text>
  })
};

export default featureAppDefinition;
