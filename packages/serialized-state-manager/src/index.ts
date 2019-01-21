import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService
} from '@feature-hub/core';
import {SerializedStateManager} from './internal/serialized-state-manager';

export interface SerializedStateManagerV0 {
  register(createSerializedState: () => string | undefined): void;
  getSerializedState(): string | undefined;
  createSerializedStates(): string;
  setSerializedStates(serializedStates: string): void;
}

export interface SharedSerializedStateManager extends SharedFeatureService {
  readonly '0.1': FeatureServiceBinder<SerializedStateManagerV0>;
}

export const serializedStateManagerDefinition: FeatureServiceProviderDefinition<
  SharedSerializedStateManager
> = {
  id: 's2:serialized-state-manager',

  create: () => {
    const serializedStateManager = new SerializedStateManager();

    return {
      '0.1': () => ({featureService: serializedStateManager})
    };
  }
};
