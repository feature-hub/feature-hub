import {Button} from '@blueprintjs/core';
import {FeatureAppDefinition} from '@feature-hub/core';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';

const featureAppDefinition: FeatureAppDefinition<ReactFeatureApp> = {
  dependencies: {
    externals: {
      react: '^16.7.0',
      '@feature-hub/react': '^2.0.0'
    }
  },

  create: ({done}) => ({
    render: () => (
      <>
        <p>Hello, World!</p>
        <Button text="I'm done" onClick={() => done && done()}></Button>
      </>
    )
  })
};

export default featureAppDefinition;
