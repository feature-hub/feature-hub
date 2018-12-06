import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';

export default {
  id: 'test:hello-world',

  create(): ReactFeatureApp {
    return {
      render: () => <span>Hello, World!</span>
    };
  }
};
