import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';

export interface ServerRequestV0 {
  readonly path: string;
  readonly cookies: Record<string, string>;
  readonly headers: Record<string, string>;
}

interface SharedServerRequest extends SharedFeatureService {
  readonly '0.1': FeatureServiceBinder<ServerRequestV0>;
}

export function defineServerRequest(
  serverRequest: ServerRequestV0
): FeatureServiceProviderDefinition {
  return {
    id: 's2:server-request',

    create: (): SharedServerRequest => ({
      '0.1': () => ({featureService: serverRequest})
    })
  };
}
