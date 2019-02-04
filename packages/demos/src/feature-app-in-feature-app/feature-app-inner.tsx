import {Label} from '@blueprintjs/core';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';

export default {
  id: 'test:hello-world-inner',

  dependencies: {
    externals: {
      react: '^16.7.0',
      '@feature-hub/react': '^0.12.0'
    }
  },

  create(): ReactFeatureApp {
    return {
      render: () => <Label>Hello, World!</Label>
    };
  }
};
