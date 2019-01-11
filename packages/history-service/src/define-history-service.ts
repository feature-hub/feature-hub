import {AsyncSsrManagerV1} from '@feature-hub/async-ssr-manager';
import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';
import * as history from 'history';
import {RootLocationTransformer} from './create-root-location-transformer';
import {createHistoryMultiplexers} from './internal/create-history-multiplexers';
import {createHistoryServiceV1Binder} from './internal/create-history-service-v1-binder';

export interface HistoryServiceV1 {
  staticRootLocation: history.Location;

  createBrowserHistory(): history.History;
  createStaticHistory(): history.History;
}

interface SharedHistoryService extends SharedFeatureService {
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
