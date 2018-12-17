import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';
import {ServerRendererV1} from '@feature-hub/server-renderer';
import {
  HistoryServiceV1,
  createHistoryServiceV1Binder
} from './history-service-v1';
import {createRootHistories} from './root-histories';
import {RootLocationTransformer} from './root-location-transformer';

export {
  Action,
  BrowserHistoryBuildOptions,
  HashHistoryBuildOptions,
  HashType,
  History,
  Location,
  LocationDescriptorObject,
  MemoryHistory,
  MemoryHistoryBuildOptions,
  UnregisterCallback
} from 'history';
export * from './root-location-transformer';
export {HistoryServiceV1} from './history-service-v1';

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
      const rootHistories = createRootHistories(serverRequest);

      return {
        '1.1': createHistoryServiceV1Binder(
          rootHistories,
          rootLocationTransformer
        )
      };
    }
  };
}
