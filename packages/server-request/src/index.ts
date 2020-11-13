import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService,
} from '@feature-hub/core';

export interface ServerRequestV1 {
  readonly url: string;
  readonly cookies: Record<string, string>;
  readonly headers: Record<string, string | string[] | undefined>;
}

export interface SharedServerRequest extends SharedFeatureService {
  readonly '1.0.0': FeatureServiceBinder<ServerRequestV1>;
}

export function defineServerRequest(
  serverRequest: ServerRequestV1
): FeatureServiceProviderDefinition<SharedServerRequest> {
  return {
    id: 's2:server-request',

    create: () => ({
      '1.0.0': () => ({featureService: serverRequest}),
    }),
  };
}
