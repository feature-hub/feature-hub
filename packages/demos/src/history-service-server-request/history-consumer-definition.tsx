import {FeatureAppDefinition} from '@feature-hub/core';
import {HistoryServiceV0} from '@feature-hub/history-service';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';
import {HistoryConsumer} from './history-consumer';

export const historyConsumerDefinition: FeatureAppDefinition<
  ReactFeatureApp,
  undefined,
  {'s2:history': HistoryServiceV0}
> = {
  id: 'test:history-consumer',

  dependencies: {
    's2:history': '^0.1'
  },

  create: ({featureServices, idSpecifier}) => {
    const historyService = featureServices['s2:history'];

    return {
      render: () => (
        <HistoryConsumer
          history={historyService.createStaticHistory()}
          idSpecifier={idSpecifier || ''}
        />
      )
    };
  }
};

export default historyConsumerDefinition;
