import {Card, Label} from '@blueprintjs/core';
import {FeatureAppDefinition, FeatureServices} from '@feature-hub/core';
import {Logger} from '@feature-hub/logger';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';
import {Monowidth} from './monowidth';

interface Dependencies extends FeatureServices {
  readonly 's2:logger': Logger;
}

const featureAppDefinition: FeatureAppDefinition<
  ReactFeatureApp,
  Dependencies
> = {
  dependencies: {
    featureServices: {'s2:logger': '^1.0.0'},
  },

  create: (env) => {
    const logger = env.featureServices['s2:logger'];

    logger.trace('logger trace test');
    logger.debug('logger debug test');
    logger.info('logger info test');
    logger.warn('logger warn test');
    logger.error('logger error test');

    return {
      render: () => (
        <Card style={{margin: '20px'}}>
          <Label>
            This is the Feature App with the name{' '}
            <Monowidth>{env.featureAppName}</Monowidth> and the ID{' '}
            <Monowidth>{env.featureAppId}</Monowidth>.
          </Label>
        </Card>
      ),
    };
  },
};

export default featureAppDefinition;
