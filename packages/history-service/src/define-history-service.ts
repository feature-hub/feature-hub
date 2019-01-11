import {AsyncSsrManagerV0} from '@feature-hub/async-ssr-manager';
import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';
import * as history from 'history';
import {RootLocationTransformer} from './create-root-location-transformer';
import {createHistoryMultiplexers} from './internal/create-history-multiplexers';
import {createHistoryServiceV0Binder} from './internal/create-history-service-v0-binder';

export interface HistoryServiceV0 {
  staticRootLocation: history.Location;

  createBrowserHistory(): history.History;
  createStaticHistory(): history.History;
}

interface SharedHistoryService extends SharedFeatureService {
  readonly '0.1': FeatureServiceBinder<HistoryServiceV0>;
}

export function defineHistoryService(
  rootLocationTransformer: RootLocationTransformer
): FeatureServiceProviderDefinition<
  undefined,
  {'s2:async-ssr-manager': AsyncSsrManagerV0 | undefined}
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
        '0.1': createHistoryServiceV0Binder(historyMultiplexers)
      };
    }
  };
}
