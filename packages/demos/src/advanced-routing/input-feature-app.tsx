import {Button, Card, ControlGroup, InputGroup} from '@blueprintjs/core';
import {FeatureAppDefinition, FeatureServices} from '@feature-hub/core';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';
import {NavigationServiceV1} from './navigation-service';

interface Dependencies extends FeatureServices {
  readonly 'test:navigation-service': NavigationServiceV1;
}

interface NameControlGroupProps {
  onSubmit(name: string): void;
}

function NameControlGroup({onSubmit}: NameControlGroupProps): JSX.Element {
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  return (
    <ControlGroup>
      <InputGroup
        id="name-input"
        placeholder="Enter a name..."
        inputRef={(element) => (inputRef.current = element)}
      />
      <Button
        id="submit-button"
        text="Say Hello"
        onClick={() => inputRef.current && onSubmit(inputRef.current.value)}
      />
    </ControlGroup>
  );
}

const featureAppDefinition: FeatureAppDefinition<
  ReactFeatureApp,
  Dependencies
> = {
  dependencies: {
    featureServices: {
      'test:navigation-service': '^1.0.0',
    },
  },

  create: ({featureServices}) => {
    const navigationService = featureServices['test:navigation-service'];

    return {
      render: () => (
        <Card style={{margin: '20px'}}>
          <NameControlGroup
            onSubmit={(name) => navigationService.navigateToHelloWorld(name)}
          />
        </Card>
      ),
    };
  },
};

export default featureAppDefinition;
