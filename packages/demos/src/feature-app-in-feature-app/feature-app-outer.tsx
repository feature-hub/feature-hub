import {Card} from '@blueprintjs/core';
import {FeatureAppDefinition} from '@feature-hub/core';
import {FeatureAppContainer, ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';
import innerFeatureAppDefinition from './feature-app-inner';

const featureAppDefinition: FeatureAppDefinition<ReactFeatureApp> = {
  dependencies: {
    externals: {
      react: '^16.7.0',
      '@feature-hub/react': '^2.0.0'
    }
  },

  create: ({featureAppId}) => ({
    render: () => (
      <Card style={{margin: '20px'}}>
        <FeatureAppContainer
          featureAppDefinition={innerFeatureAppDefinition}
          featureAppId={`${featureAppId}:test:hello-world-inner`}
        />
      </Card>
    )
  })
};

export default featureAppDefinition;
