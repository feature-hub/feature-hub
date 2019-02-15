import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  FeatureServices,
  SharedFeatureService
} from '@feature-hub/core';
import {ServerRequestV0} from '@feature-hub/server-request';
import * as history from 'history';
import {RootLocationTransformer} from './create-root-location-transformer';
import {createHistoryMultiplexers} from './internal/create-history-multiplexers';
import {createHistoryServiceV0Binder} from './internal/create-history-service-v0-binder';

export interface HistoryServiceV0 {
  staticRootLocation: history.Location;

  createBrowserHistory(): history.History;
  createStaticHistory(): history.History;
}

export interface SharedHistoryService extends SharedFeatureService {
  readonly '1.0.0': FeatureServiceBinder<HistoryServiceV0>;
}

export interface HistoryServiceDependencies extends FeatureServices {
  's2:server-request'?: ServerRequestV0;
}

export function defineHistoryService(
  rootLocationTransformer: RootLocationTransformer
): FeatureServiceProviderDefinition<
  SharedHistoryService,
  HistoryServiceDependencies
> {
  return {
    id: 's2:history',
    optionalDependencies: {
      featureServices: {'s2:server-request': '^1.0.0'}
    },

    create: env => {
      const serverRequest = env.featureServices['s2:server-request'];

      const historyMultiplexers = createHistoryMultiplexers(
        rootLocationTransformer,
        serverRequest
      );

      return {
        '1.0.0': createHistoryServiceV0Binder(historyMultiplexers)
      };
    }
  };
}
