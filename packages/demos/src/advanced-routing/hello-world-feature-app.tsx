import {Card, Text} from '@blueprintjs/core';
import {FeatureAppDefinition, FeatureServices} from '@feature-hub/core';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';
import {HelloWorldServiceV1} from './hello-world-service';

interface Dependencies extends FeatureServices {
  readonly 'test:hello-world-service': HelloWorldServiceV1;
}

interface HelloWorldTextProps {
  readonly helloWorldService: HelloWorldServiceV1;
}

function HelloWorldText({helloWorldService}: HelloWorldTextProps): JSX.Element {
  const [name, setName] = React.useState(helloWorldService.name);

  React.useEffect(
    () => helloWorldService.listen(() => setName(helloWorldService.name)),
    [helloWorldService]
  );

  return (
    <Text>
      <span id="hello-text">Hello, {name}!</span>
    </Text>
  );
}

const featureAppDefinition: FeatureAppDefinition<
  ReactFeatureApp,
  Dependencies
> = {
  dependencies: {
    featureServices: {
      'test:hello-world-service': '^1.0.0',
    },
  },

  create: ({featureServices}) => ({
    render: () => (
      <Card style={{margin: '20px'}}>
        <HelloWorldText
          helloWorldService={featureServices['test:hello-world-service']}
        />
      </Card>
    ),
  }),
};

export default featureAppDefinition;
