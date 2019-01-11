import {AsyncSsrManagerV1} from '@feature-hub/async-ssr-manager';
import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';
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
  {'s2:async-ssr-manager': AsyncSsrManagerV1 | undefined}
> {
  return {
    id: 's2:history',
    optionalDependencies: {'s2:async-ssr-manager': '^1.0'},

    create: (env): SharedHistoryService => {
      const asyncSsrManager = env.featureServices['s2:async-ssr-manager'];

      const historyMultiplexers = createHistoryMultiplexers(
        rootLocationTransformer,
        asyncSsrManager && asyncSsrManager.serverRequest
      );

      return {
        '1.1': createHistoryServiceV1Binder(historyMultiplexers)
      };
    }
  };
}
