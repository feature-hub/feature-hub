import {Card, Label} from '@blueprintjs/core';
import {FeatureAppDefinition} from '@feature-hub/core';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';

const featureAppDefinition: FeatureAppDefinition<ReactFeatureApp> = {
  create(): ReactFeatureApp {
    return {
      render: () => (
        <Card style={{margin: '20px'}}>
          <Label>Hello, World!</Label>
        </Card>
      )
    };
  }
};

export default featureAppDefinition;
