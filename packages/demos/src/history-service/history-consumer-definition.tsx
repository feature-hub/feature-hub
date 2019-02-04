import {FeatureAppDefinition} from '@feature-hub/core';
import {HistoryServiceV0} from '@feature-hub/history-service';
import {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';
import {HistoryConsumer} from './history-consumer';

const inBrowser = typeof window !== 'undefined';

export const historyConsumerDefinition: FeatureAppDefinition<
  ReactFeatureApp,
  undefined,
  {'s2:history': HistoryServiceV0}
> = {
  id: 'test:history-consumer',

  dependencies: {
    featureServices: {
      's2:history': '^0.1.0'
    }
  },

  create: ({featureServices, idSpecifier}) => {
    const historyService = featureServices['s2:history'];

    const history = inBrowser
      ? historyService.createBrowserHistory()
      : historyService.createStaticHistory();

    return {
      render: () => (
        <HistoryConsumer history={history} idSpecifier={idSpecifier || ''} />
      )
    };
  }
};

export default historyConsumerDefinition;
