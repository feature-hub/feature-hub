import {Label} from '@blueprintjs/core';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';

export default {
  id: 'test:hello-world-inner',

  create(): ReactFeatureApp {
    return {
      render: () => <Label>Hello, World!</Label>
    };
  }
};
