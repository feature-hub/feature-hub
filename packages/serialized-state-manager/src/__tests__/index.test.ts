import {FeatureServiceEnvironment} from '@feature-hub/core';
import {SerializedStateManagerV1, serializedStateManagerDefinition} from '..';

describe('serializedStateManagerDefinition', () => {
  let mockEnv: FeatureServiceEnvironment<{}>;

  beforeEach(() => {
    mockEnv = {featureServices: {}};
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
    it('creates a shared Feature Service containing version 1.0.0', () => {
      const sharedSerializedStateManager = serializedStateManagerDefinition.create(
        mockEnv
      );

      expect(sharedSerializedStateManager['1.0.0']).toBeDefined();
    });
  });

  describe('SerializedStateManagerV1', () => {
    let integratorSerializedStateManager: SerializedStateManagerV1;
    let consumer1SerializedStateManager: SerializedStateManagerV1;
    let consumer2SerializedStateManager: SerializedStateManagerV1;

    beforeEach(() => {
      const serializedStateManagerBinder = serializedStateManagerDefinition.create(
        mockEnv
      )['1.0.0'];

      integratorSerializedStateManager = serializedStateManagerBinder(
        'test:integrator'
      ).featureService;

      consumer1SerializedStateManager = serializedStateManagerBinder(
        'test:consumer:1'
      ).featureService;

      consumer2SerializedStateManager = serializedStateManagerBinder(
        'test:consumer:2'
      ).featureService;
    });

    describe('#serializeStates', () => {
      describe('when no consumer has called #register', () => {
        it('returns a stringified empty object', () => {
          expect(integratorSerializedStateManager.serializeStates()).toBe(
            encodeURI(JSON.stringify({}))
          );
        });
      });

      describe('when consumers have called #register', () => {
        beforeEach(() => {
          consumer1SerializedStateManager.register(() =>
            JSON.stringify({kind: 'foo'})
          );

          consumer2SerializedStateManager.register(() =>
            JSON.stringify({kind: 'bar'})
          );
        });

        it('returns a stringified and encoded object with all serialized consumer states', () => {
          expect(integratorSerializedStateManager.serializeStates()).toBe(
            encodeURI(
              JSON.stringify({
                'test:consumer:1': JSON.stringify({kind: 'foo'}),
                'test:consumer:2': JSON.stringify({kind: 'bar'})
              })
            )
          );
        });
      });
    });

    describe('#getSerializedState', () => {
      describe('when the integrator has not called #setSerializedStates', () => {
        it('returns undefined', () => {
          expect(
            consumer1SerializedStateManager.getSerializedState()
          ).toBeUndefined();

          expect(
            consumer2SerializedStateManager.getSerializedState()
          ).toBeUndefined();
        });
      });

      describe('when the integrator has called #setSerializedStates with serialized state for only the first consumer', () => {
        beforeEach(() => {
          integratorSerializedStateManager.setSerializedStates(
            encodeURI(
              JSON.stringify({
                'test:consumer:1': JSON.stringify({kind: 'foo'})
              })
            )
          );
        });

        it('returns the serialized state for the first consumer', () => {
          expect(consumer1SerializedStateManager.getSerializedState()).toBe(
            JSON.stringify({kind: 'foo'})
          );
        });

        it('returns undefined for the second consumer', () => {
          expect(
            consumer2SerializedStateManager.getSerializedState()
          ).toBeUndefined();
        });
      });
    });
  });
});
