import {
  FeatureServiceBinder,
  FeatureServiceConsumerEnvironment,
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
): FeatureServiceProviderDefinition {
  return {
    id: 's2:history',
    dependencies: {'s2:server-renderer': '^1.0'},

    create: ({featureServices}: FeatureServiceConsumerEnvironment) => {
      let browserHistory: history.History;
      let memoryHistory: history.MemoryHistory;

      return {
        '1.1': (consumerId: string) => {
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
              const rootHistory = browserHistory || memoryHistory;

              return rootHistory && rootHistory.location;
            },

            createBrowserHistory(): history.History {
              browserHistory = browserHistory || history.createBrowserHistory();

              return registerConsumerHistory(
                new BrowserHistory(
                  consumerId,
                  browserHistory,
                  rootLocationTransformer
                )
              );
            },

            createMemoryHistory(): history.MemoryHistory {
              const {serverRequest} = featureServices[
                's2:server-renderer'
              ] as ServerRendererV1;

              if (!serverRequest) {
                throw new Error(
                  'Memory history can not be created without a server request.'
                );
              }

              memoryHistory =
                memoryHistory ||
                history.createMemoryHistory({
                  initialEntries: [serverRequest.path]
                });

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
