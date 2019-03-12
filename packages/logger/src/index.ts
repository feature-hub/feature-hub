import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  Logger,
  SharedFeatureService
} from '@feature-hub/core';

export {Logger} from '@feature-hub/core';

export interface SharedLogger extends SharedFeatureService {
  readonly '1.0.0': FeatureServiceBinder<Logger>;
}

export type CreateConsumerLogger = (consumerUid: string) => Logger;

export function defineLogger(
  createConsumerLogger: CreateConsumerLogger = () => console
): FeatureServiceProviderDefinition<SharedLogger> {
  return {
    id: 's2:logger',

    create: () => ({
      '1.0.0': consumerUid => ({
        featureService: createConsumerLogger(consumerUid)
      })
    })
  };
}
