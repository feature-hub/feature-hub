import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';
import {ConsumerLocation, HistoryServiceV2} from '@feature-hub/history-service';
import * as history from 'history';
import {HelloWorldServiceV1} from './hello-world-service';

export interface NavigationServiceV1 {
  readonly history: history.History;
  navigateToHelloWorld(name: string): void;
}

export interface SharedNavigationService extends SharedFeatureService {
  readonly '1.0.0': FeatureServiceBinder<NavigationServiceV1>;
}

export interface NavigationServiceDependencies {
  readonly 'test:hello-world-service': HelloWorldServiceV1;
  readonly 's2:history': HistoryServiceV2;
}

export const navigationServiceDefinition: FeatureServiceProviderDefinition<
  SharedNavigationService,
  NavigationServiceDependencies
> = {
  id: 'test:navigation-service',

  dependencies: {
    featureServices: {
      's2:history': '^2.0.0',
      'test:hello-world-service': '^1.0.0'
    }
  },

  create: ({featureServices}) => {
    const historyService = featureServices['s2:history'];
    const helloWorldService = featureServices['test:hello-world-service'];

    return {
      '1.0.0': () => ({
        featureService: {
          history: historyService.history,

          navigateToHelloWorld(name: string): void {
            const pageLocation: ConsumerLocation = {
              historyKey: historyService.historyKey,
              location: {pathname: '/page2'}
            };

            const helloWorldLocation = helloWorldService.createLocation(name);

            const rootLocation = historyService.createNewRootLocationForMultipleConsumers(
              pageLocation,
              helloWorldLocation
            );

            historyService.rootHistory.push(rootLocation);
          }
        }
      })
    };
  }
};
