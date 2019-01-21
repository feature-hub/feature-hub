import {
  FeatureServiceBinder,
  FeatureServiceEnvironment
} from '@feature-hub/core';
import {SerializedStateManagerV0, serializedStateManagerDefinition} from '..';

describe('serializedStateManagerDefinition', () => {
  let mockEnv: FeatureServiceEnvironment<undefined, {}>;

  beforeEach(() => {
    mockEnv = {
      config: undefined,
      featureServices: {}
    };
  });

  it('defines an id', () => {
    expect(serializedStateManagerDefinition.id).toBe(
      's2:serialized-state-manager'
    );
  });

  it('has no dependencies', () => {
    expect(serializedStateManagerDefinition.dependencies).toBeUndefined();

    expect(
      serializedStateManagerDefinition.optionalDependencies
    ).toBeUndefined();
  });

  describe('#create', () => {
    it('creates a shared Feature Service containing version 0.1', () => {
      const sharedSerializedStateManager = serializedStateManagerDefinition.create(
        mockEnv
      );

      expect(sharedSerializedStateManager['0.1']).toBeDefined();
    });
  });

  describe('SerializedStateManagerV0', () => {
    let serializedStateManagerBinder: FeatureServiceBinder<
      SerializedStateManagerV0
    >;

    beforeEach(() => {
      serializedStateManagerBinder = serializedStateManagerDefinition.create(
        mockEnv
      )['0.1'];
    });

    it('does not implement anything yet', () => {
      const serializedStateManager = serializedStateManagerBinder(
        'test:consumer'
      ).featureService;

      expect(() =>
        serializedStateManager.createSerializedStates()
      ).toThrowError('Method not implemented.');

      expect(() => serializedStateManager.getSerializedState()).toThrowError(
        'Method not implemented.'
      );

      expect(() => serializedStateManager.register(jest.fn())).toThrowError(
        'Method not implemented.'
      );

      expect(() => serializedStateManager.setSerializedStates('')).toThrowError(
        'Method not implemented.'
      );
    });
  });
});
