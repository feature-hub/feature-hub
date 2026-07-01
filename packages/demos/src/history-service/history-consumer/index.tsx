import type {FeatureAppDefinition, FeatureServices} from '@feature-hub/core';
import type {HistoryServiceV3} from '@feature-hub/history-service';
import type {ReactFeatureApp} from '@feature-hub/react';
import * as React from 'react';
import {unstable_HistoryRouter as HistoryRouter} from 'react-router-dom';
import {HistoryConsumer} from './history-consumer';
import {adaptV7History} from '@feature-hub/react-router-v7-adapter';

interface Dependencies extends FeatureServices {
  readonly 's2:history': HistoryServiceV3;
}

export const historyConsumerDefinition: FeatureAppDefinition<
  ReactFeatureApp,
  Dependencies
> = {
  dependencies: {
    featureServices: {
      's2:history': '^3.0.0',
    },
  },

  create: ({featureServices}) => {
    const {history, historyKey} = featureServices['s2:history'];

    return {
      render: () => (
        <HistoryRouter history={adaptV7History(history)}>
          <HistoryConsumer historyKey={historyKey} />
        </HistoryRouter>
      ),
    };
  },
};
