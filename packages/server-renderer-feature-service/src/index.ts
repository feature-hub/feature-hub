import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';

export interface ServerRequest {
  readonly path: string;
  readonly cookies: Record<string, string>;
  readonly headers: Record<string, string>;
}

export interface ServerRendererV1 {
  readonly serverRequest: ServerRequest | undefined;
}

export interface SharedServerRenderer extends SharedFeatureService {
  readonly '1.0': FeatureServiceBinder<ServerRendererV1>;
}

export function defineServerRenderer(
  serverRequest: ServerRequest | undefined
): FeatureServiceProviderDefinition {
  return {
    id: 's2:server-renderer',

    create(): SharedServerRenderer {
      return {
        '1.0': () => ({featureService: {serverRequest}})
      };
    }
  };
}
