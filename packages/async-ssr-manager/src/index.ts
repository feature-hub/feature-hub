import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';
import {AsyncSsrManager} from './internal/async-ssr-manager';
import {validateConfig} from './internal/validate-config';

export interface ServerRequest {
  readonly path: string;
  readonly cookies: Record<string, string>;
  readonly headers: Record<string, string>;
}

export interface AsyncSsrManagerConfig {
  readonly timeout?: number;
}

export interface AsyncSsrManagerV0 {
  readonly serverRequest: ServerRequest | undefined;

  renderUntilCompleted(render: () => string): Promise<string>;
  rerenderAfter(promise: Promise<unknown>): void;
}

interface SharedAsyncSsrManager extends SharedFeatureService {
  readonly '0.1': FeatureServiceBinder<AsyncSsrManagerV0>;
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
        '0.1': () => ({featureService: asyncSsrManager})
      };
    }
  };
}
