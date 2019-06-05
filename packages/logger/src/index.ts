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

export type ConsumerLoggerCreator = (consumerId: string) => Logger;

export function defineLogger(
  createConsumerLogger: ConsumerLoggerCreator = () => console
): FeatureServiceProviderDefinition<SharedLogger> {
  return {
    id: 's2:logger',

    create: () => ({
      '1.0.0': consumerId => ({
        featureService: createConsumerLogger(consumerId)
      })
    })
  };
}
