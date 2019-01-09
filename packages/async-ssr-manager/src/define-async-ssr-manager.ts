import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';
import {
  AsyncSsrManager,
  AsyncSsrManagerV1,
  ServerRequest
} from './async-ssr-manager-v1';
import {AsyncSsrManagerConfig, validateConfig} from './config';

export interface SharedAsyncSsrManager extends SharedFeatureService {
  readonly '1.0': FeatureServiceBinder<AsyncSsrManagerV1>;
}

export function defineAsyncSsrManager(
  serverRequest: ServerRequest | undefined
): FeatureServiceProviderDefinition {
  return {
    id: 's2:async-ssr-manager',

    create: (env): SharedAsyncSsrManager => {
      const {timeout} =
        validateConfig(env.config) || ({} as AsyncSsrManagerConfig);

      const asyncSsrManager = new AsyncSsrManager(serverRequest, timeout);

      return {
        '1.0': () => ({featureService: asyncSsrManager})
      };
    }
  };
}
