import {Card} from '@blueprintjs/core';
import {FeatureAppDefinition} from '@feature-hub/core';
import {FeatureAppContainer, ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';
import innerFeatureAppDefinition from './feature-app-inner';

const id = 'test:hello-world-outer';

const featureAppDefinition: FeatureAppDefinition<ReactFeatureApp> = {
  id,

  dependencies: {
    externals: {
      react: '^16.7.0',
      '@feature-hub/react': '~0.12.0'
    }
  },

  create: () => ({
    render: () => (
      <Card style={{margin: '20px'}}>
        <FeatureAppContainer
          featureAppDefinition={innerFeatureAppDefinition}
          idSpecifier={id}
        />
      </Card>
    )
  })
};

export default featureAppDefinition;
