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

export interface HelloWorldServiceV1 {
  name: string;
  listen(listener: () => void): () => void;
  createLocation(name: string): ConsumerLocationV3;
}

export interface SharedHelloWorldService extends SharedFeatureService {
  readonly '1.0.0': FeatureServiceBinder<HelloWorldServiceV1>;
}

export interface HelloWorldServiceDependencies extends FeatureServices {
  readonly 's2:history': HistoryServiceV3;
}

export const helloWorldServiceDefinition: FeatureServiceProviderDefinition<
  SharedHelloWorldService,
  HelloWorldServiceDependencies
> = {
  id: 'test:hello-world-service',

  dependencies: {
    featureServices: {
      's2:history': '^3.0.0',
    },
  },

  create: ({featureServices}) => {
    const {historyKey, history} = featureServices['s2:history'];

    return {
      '1.0.0': () => ({
        featureService: {
          get name(): string {
            return history.location.pathname.slice(1) || 'World';
          },

          set name(value: string) {
            const {location} = this.createLocation(value);
            history.push(location);
          },

          listen(listener: () => void): () => void {
            return history.listen(listener);
          },

          createLocation(name: string): ConsumerLocationV3 {
            return {historyKey, location: {pathname: `/${name}`}};
          },
        },
      }),
    };
  },
};
