import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';

export interface ServerRequestV0 {
  readonly url: string;
  readonly cookies: Record<string, string>;
  readonly headers: Record<string, string | string[] | undefined>;
}

export interface SharedServerRequest extends SharedFeatureService {
  readonly '1.0.0': FeatureServiceBinder<ServerRequestV0>;
}

export function defineServerRequest(
  serverRequest: ServerRequestV0
): FeatureServiceProviderDefinition<SharedServerRequest> {
  return {
    id: 's2:server-request',

    create: () => ({
      '1.0.0': () => ({featureService: serverRequest})
    })
  };
}
