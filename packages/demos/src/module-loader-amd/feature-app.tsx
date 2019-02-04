import {Card, Label} from '@blueprintjs/core';
import {FeatureAppDefinition} from '@feature-hub/core';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';

export default {
  id: 'test:hello-world',

  dependencies: {
    externals: {
      react: '^16.7.0'
    }
  },

  create: () => ({
    render: () => (
      <Card style={{margin: '20px'}}>
        <Label>Hello, World!</Label>
      </Card>
    )
  })
} as FeatureAppDefinition<ReactFeatureApp>;
