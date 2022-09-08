import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  FeatureServices,
  SharedFeatureService,
} from '@feature-hub/core';
import {
  ConsumerLocationV3,
  HistoryServiceV3,
} from '@feature-hub/history-service';
import {History} from 'history';
import {HelloWorldServiceV1} from './hello-world-service';

export interface NavigationServiceV1 {
  readonly history: History;
  navigateToHelloWorld(name: string): void;
}

export interface SharedNavigationService extends SharedFeatureService {
  readonly '1.0.0': FeatureServiceBinder<NavigationServiceV1>;
}

export interface NavigationServiceDependencies extends FeatureServices {
  readonly 'test:hello-world-service': HelloWorldServiceV1;
  readonly 's2:history': HistoryServiceV3;
}

export const navigationServiceDefinition: FeatureServiceProviderDefinition<
  SharedNavigationService,
  NavigationServiceDependencies
> = {
  id: 'test:navigation-service',

  dependencies: {
    featureServices: {
      's2:history': '^3.0.0',
      'test:hello-world-service': '^1.0.0',
    },
  },

  create: ({featureServices}) => {
    const {
      history,
      historyKey,
      rootHistory,
      createNewRootLocationForMultipleConsumers,
    } = featureServices['s2:history'];

    const helloWorldService = featureServices['test:hello-world-service'];

    return {
      '1.0.0': () => ({
        featureService: {
          history,

          navigateToHelloWorld(name: string): void {
            const pageLocation: ConsumerLocationV3 = {
              historyKey,
              location: {pathname: '/page2'},
            };

            const helloWorldLocation = helloWorldService.createLocation(name);

            const {state, ...to} = createNewRootLocationForMultipleConsumers(
              pageLocation,
              helloWorldLocation
            );

            rootHistory.push(to, state);
          },
        },
      }),
    };
  },
};
