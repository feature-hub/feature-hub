import {AnchorButton, Card} from '@blueprintjs/core';
import {FeatureAppEnvironment, FeatureServices} from '@feature-hub/core';
import {FeatureAppContainer} from '@feature-hub/react';
import * as React from 'react';
import featureAppDefinition from './feature-app';
import {Monowidth} from './monowidth';

export interface AppProps {
  readonly useConsumerName: boolean;

  readonly beforeCreate?: (
    env: FeatureAppEnvironment<FeatureServices, undefined>
  ) => void;
}

export function App({useConsumerName, beforeCreate}: AppProps): JSX.Element {
  return (
    <>
      <Card style={{margin: '20px'}}>
        <AnchorButton
          text={
            <>
              Use{' '}
              <Monowidth>
                <strong>
                  {useConsumerName ? 'consumerId' : 'consumerName'}
                </strong>
              </Monowidth>{' '}
              for logging
            </>
          }
          href={useConsumerName ? '/' : '/?consumerName=true'}
        />
      </Card>
      <FeatureAppContainer
        featureAppDefinition={featureAppDefinition}
        featureAppId="test:logging-app:first"
        featureAppName="test:logging-app"
        beforeCreate={beforeCreate}
      />
      <FeatureAppContainer
        featureAppDefinition={featureAppDefinition}
        featureAppId="test:logging-app:second"
        featureAppName="test:logging-app"
        beforeCreate={beforeCreate}
      />
    </>
  );
}
