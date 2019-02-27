import {Card} from '@blueprintjs/core';
import {FeatureAppDefinition} from '@feature-hub/core';
import {FeatureAppContainer, ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';
import featureAppDefinition from './feature-app-inner';

const id = 'test:hello-world-outer';

export default {
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
          featureAppDefinition={featureAppDefinition}
          idSpecifier={id}
        />
      </Card>
    )
  })
} as FeatureAppDefinition<ReactFeatureApp>;
