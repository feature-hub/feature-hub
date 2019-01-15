import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';
import {AsyncSsrManager} from './internal/async-ssr-manager';
import {validateConfig} from './internal/validate-config';

export interface AsyncSsrManagerConfig {
  readonly timeout?: number;
}

export interface AsyncSsrManagerV0 {
  renderUntilCompleted(render: () => string): Promise<string>;
  rerender(): void;
  rerenderAfter(promise: Promise<unknown>): void;
}

export interface SharedAsyncSsrManager extends SharedFeatureService {
  readonly '0.1': FeatureServiceBinder<AsyncSsrManagerV0>;
}

export const asyncSsrManagerDefinition: FeatureServiceProviderDefinition<
  SharedAsyncSsrManager
> = {
  id: 's2:async-ssr-manager',

  create: env => {
    const {timeout} =
      validateConfig(env.config) || ({} as AsyncSsrManagerConfig);

    const asyncSsrManager = new AsyncSsrManager(timeout);

    return {
      '0.1': () => ({featureService: asyncSsrManager})
    };
  }
};
