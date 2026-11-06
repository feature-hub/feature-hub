import {Card, Text} from '@blueprintjs/core';
import {FeatureAppDefinition} from '@feature-hub/core';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';

// Uses a hook so a React copy that isn't shared with the host fails loudly.
function Greeting(): JSX.Element {
  const [text] = React.useState('Hello from Vite Feature App 3!');

  return <Text>{text}</Text>;
}

const featureAppDefinition: FeatureAppDefinition<ReactFeatureApp> = {
  create: () => ({
    render: () => (
      <Card style={{margin: '20px'}}>
        <Greeting />
      </Card>
    ),
  }),
};

export default featureAppDefinition;
