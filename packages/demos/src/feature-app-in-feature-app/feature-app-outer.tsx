import {Card} from '@blueprintjs/core';
import {FeatureAppContainer, ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';
import featureAppDefinition from './feature-app-inner';

export default {
  id: 'test:hello-world-outer',

  create(): ReactFeatureApp {
    return {
      render: () => (
        <Card style={{margin: '20px'}}>
          <FeatureAppContainer featureAppDefinition={featureAppDefinition} />
        </Card>
      )
    };
  }
};
