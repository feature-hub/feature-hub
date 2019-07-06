import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  FeatureServices,
  SharedFeatureService
} from '@feature-hub/core';
import {ConsumerLocation, HistoryServiceV2} from '@feature-hub/history-service';
import * as history from 'history';

export interface HelloWorldServiceV1 {
  name: string;
  listen(listener: () => void): () => void;
  createLocation(name: string): ConsumerLocation;
}

export interface SharedHelloWorldService extends SharedFeatureService {
  readonly '1.0.0': FeatureServiceBinder<HelloWorldServiceV1>;
}

export interface HelloWorldServiceDependencies extends FeatureServices {
  readonly 's2:history': HistoryServiceV2;
}

export const helloWorldServiceDefinition: FeatureServiceProviderDefinition<
  SharedHelloWorldService,
  HelloWorldServiceDependencies
> = {
  id: 'test:hello-world-service',

  dependencies: {
    featureServices: {
      's2:history': '^2.0.0'
    }
  },

  create: ({featureServices}) => {
    const historyService = featureServices['s2:history'];

    return {
      '1.0.0': () => ({
        featureService: {
          get name(): string {
            return historyService.history.location.pathname.slice(1) || 'World';
          },

          set name(value: string) {
            const {location} = this.createLocation(value);
            historyService.history.push(location);
          },

          listen(listener: () => void): () => void {
            return historyService.history.listen(listener);
          },

          createLocation(name: string): ConsumerLocation {
            return {
              historyKey: historyService.historyKey,
              location: history.createLocation(`/${name}`)
            };
          }
        }
      })
    };
  }
};
