import {Card} from '@blueprintjs/core';
import {FeatureAppDefinition} from '@feature-hub/core';
import {FeatureAppContainer, ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';
import innerFeatureAppDefinition from './feature-app-inner';

interface OuterFeatureAppProps {
  readonly featureAppId: string;
}

function OuterFeatureApp({featureAppId}: OuterFeatureAppProps): JSX.Element {
  const [done, setDone] = React.useState(false);

  return (
    <Card style={{margin: '20px'}}>
      {done ? (
        'Bye!'
      ) : (
        <FeatureAppContainer
          featureAppDefinition={innerFeatureAppDefinition}
          featureAppId={`${featureAppId}:test:hello-world-inner`}
          done={() => setDone(true)}
        />
      )}
    </Card>
  );
}

const featureAppDefinition: FeatureAppDefinition<ReactFeatureApp> = {
  dependencies: {
    externals: {
      react: '^16.7.0',
      '@feature-hub/react': '^2.0.0',
    },
  },

  create: ({featureAppId}) => ({
    render: () => <OuterFeatureApp featureAppId={featureAppId} />,
  }),
};

export default featureAppDefinition;
