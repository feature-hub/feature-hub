import {Button} from '@blueprintjs/core';
import type {FeatureAppDefinition} from '@feature-hub/core';
import type {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';

const featureAppDefinition: FeatureAppDefinition<ReactFeatureApp> = {
  create: ({done}) => ({
    render: () => (
      <>
        <p>Hello, World!</p>
        {/** biome-ignore lint/complexity/useOptionalChain: legacy implementation */}
        <Button text="I'm done" onClick={() => done && done()}></Button>
      </>
    ),
  }),
};

export default featureAppDefinition;
