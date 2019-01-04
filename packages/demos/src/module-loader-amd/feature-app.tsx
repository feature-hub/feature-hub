import {Card, Label} from '@blueprintjs/core';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';

export default {
  id: 'test:hello-world',

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
