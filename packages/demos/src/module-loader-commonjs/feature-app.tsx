import {Card, Text} from '@blueprintjs/core';
import type {FeatureAppDefinition} from '@feature-hub/core';
import type {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';

const featureAppDefinition: FeatureAppDefinition<ReactFeatureApp> = {
  create(): ReactFeatureApp {
    return {
      render: () => (
        <Card style={{margin: '20px'}}>
          <Text>Hello, World!</Text>
        </Card>
      ),
    };
  },
};

export default featureAppDefinition;
