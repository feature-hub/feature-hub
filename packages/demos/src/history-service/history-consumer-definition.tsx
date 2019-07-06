import {FeatureAppDefinition, FeatureServices} from '@feature-hub/core';
import {HistoryServiceV2} from '@feature-hub/history-service';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';
import {HistoryConsumer} from './history-consumer';

interface Dependencies extends FeatureServices {
  readonly 's2:history': HistoryServiceV2;
}

export const historyConsumerDefinition: FeatureAppDefinition<
  ReactFeatureApp,
  Dependencies
> = {
  dependencies: {
    featureServices: {
      's2:history': '^2.0.0'
    }
  },

  create: ({featureServices}) => {
    const historyService = featureServices['s2:history'];

    return {
      render: () => (
        <HistoryConsumer
          history={historyService.history}
          historyKey={historyService.historyKey}
        />
      )
    };
  }
};

export default historyConsumerDefinition;
