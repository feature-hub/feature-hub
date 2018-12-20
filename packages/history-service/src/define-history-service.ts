import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';
import {ServerRendererV1} from '@feature-hub/server-renderer';
import {RootLocationTransformer} from './create-root-location-transformer';
import {
  HistoryServiceV1,
  createHistoryServiceV1Binder
} from './history-service-v1';
import {createHistoryMultiplexers} from './internal/create-history-multiplexers';

export interface SharedHistoryService extends SharedFeatureService {
  readonly '1.1': FeatureServiceBinder<HistoryServiceV1>;
}

export function defineHistoryService(
  rootLocationTransformer: RootLocationTransformer
): FeatureServiceProviderDefinition<
  undefined,
  {'s2:server-renderer': ServerRendererV1}
> {
  return {
    id: 's2:history',
    dependencies: {'s2:server-renderer': '^1.0'},

    create: (env): SharedHistoryService => {
      const {serverRequest} = env.featureServices['s2:server-renderer'];

      const historyMultiplexers = createHistoryMultiplexers(
        rootLocationTransformer,
        serverRequest
      );

      return {
        '1.1': createHistoryServiceV1Binder(historyMultiplexers)
      };
    }
  };
}
