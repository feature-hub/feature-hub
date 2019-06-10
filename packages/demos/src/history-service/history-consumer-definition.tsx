import {FeatureAppDefinition} from '@feature-hub/core';
import {HistoryServiceV1} from '@feature-hub/history-service';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';
import {HistoryConsumer} from './history-consumer';

const inBrowser = typeof window !== 'undefined';

interface Dependencies {
  readonly 's2:history': HistoryServiceV1;
}

export const historyConsumerDefinition: FeatureAppDefinition<
  ReactFeatureApp,
  Dependencies
> = {
  dependencies: {
    featureServices: {
      's2:history': '^1.0.0'
    }
  },

  create: ({featureServices, featureAppId}) => {
    const historyService = featureServices['s2:history'];

    const history = inBrowser
      ? historyService.createBrowserHistory()
      : historyService.createStaticHistory();

    return {
      render: () => (
        <HistoryConsumer history={history} consumerId={featureAppId} />
      )
    };
  }
};

export default historyConsumerDefinition;
