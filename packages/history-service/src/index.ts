import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';
import {ServerRendererV1} from '@feature-hub/server-renderer';
import * as history from 'history';
import {ConsumerHistory} from './base-history';
import {BrowserHistory} from './browser-history';
import {MemoryHistory} from './memory-history';
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

export interface HistoryServiceV1 {
  readonly rootLocation?: history.Location;
  createBrowserHistory(): history.History;
  createMemoryHistory(): history.MemoryHistory;
}

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
      let browserHistory: history.History;
      let memoryHistory: history.MemoryHistory;

      return {
        '1.1': consumerId => {
          const consumerHistories: ConsumerHistory[] = [];

          const registerConsumerHistory = <
            TConsumerHistory extends ConsumerHistory
          >(
            consumerHistory: TConsumerHistory
          ) => {
            consumerHistories.push(consumerHistory);

            return consumerHistory;
          };

          const featureService: HistoryServiceV1 = {
            get rootLocation(): history.Location | undefined {
              return memoryHistory && memoryHistory.location;
            },

            createBrowserHistory(): history.History {
              if (!browserHistory) {
                browserHistory = history.createBrowserHistory();
                // We need to replace the initial location with itself to make
                // sure a key is defined.
                // See also https://github.com/ReactTraining/history/issues/502
                browserHistory.replace(browserHistory.location);
              }

              return registerConsumerHistory(
                new BrowserHistory(
                  consumerId,
                  browserHistory,
                  rootLocationTransformer
                )
              );
            },

            createMemoryHistory(): history.MemoryHistory {
              const {serverRequest} = env.featureServices['s2:server-renderer'];

              if (!serverRequest) {
                throw new Error(
                  'Memory history can not be created without a server request.'
                );
              }

              if (!memoryHistory) {
                const initialEntries = [serverRequest.path];
                memoryHistory = history.createMemoryHistory({initialEntries});
              }

              return registerConsumerHistory(
                new MemoryHistory(
                  consumerId,
                  memoryHistory,
                  rootLocationTransformer
                )
              );
            }
          };

          const unbind = () => {
            consumerHistories.forEach(consumerHistory =>
              consumerHistory.destroy()
            );
          };

          return {featureService, unbind};
        }
      };
    }
  };
}
