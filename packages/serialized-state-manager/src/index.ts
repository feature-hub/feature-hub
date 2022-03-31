import {
  FeatureServiceBinder,
  FeatureServiceProviderDefinition,
  SharedFeatureService,
} from '@feature-hub/core';
import {ClientSideStateManager} from './internal/client-side-state-manager';
import {SerializedStateManager} from './internal/serialized-state-manager';
import {ServerSideStateManager} from './internal/server-side-state-manager';

export interface SerializedStateManagerV1 {
  /**
   * This method is intended to be called by consumers, i.e. Feature Apps and
   * Feature Services, on the server to register a callback that serializes
   * their state.
   *
   * @param serializeState A callback that returns the consumer state as a
   * serialized string.
   */
  register(serializeState: () => string): void;

  /**
   * This method is intended to be called by the integrator on the server when
   * the server-side rendering has been completed, to serialize all consumer
   * states. The returned string is encoded, so that it can be safely injected
   * into an HTML document. On the client, this string must be passed unmodified
   * into [[setSerializedStates]] where it will be decoded again.
   */
  serializeStates(): string;

  /**
   * This method is intended to be called by the integrator on the client to
   * provide the serialized state to all consumers, i.e. Feature Apps and
   * Feature Services, (via [[getSerializedState]]) that serialized their
   * state on the server.
   *
   * @param serializedStates The string that was created on the server with
   * [[serializeStates]].
   */
  setSerializedStates(serializedStates: string): void;

  /**
   * This method is intended to be called by consumers, i.e. Feature Apps and
   * Feature Services, on the client to retrieve the serialized state that was
   * created on the server.
   */
  getSerializedState(): string | undefined;
}

export interface SharedSerializedStateManager extends SharedFeatureService {
  readonly '1.0.0': FeatureServiceBinder<SerializedStateManagerV1>;
}

/**
 * On the client this can be called with serialized states to create a
 * Serialized State Manager definition that is already populated with the given
 * serialized states, avoiding the need for the Integrator to call
 * [[SerializedStateManagerV1.setSerializedStates]] after its creation.
 */
export function defineSerializedStateManager(
  serializedStates?: string
): FeatureServiceProviderDefinition<SharedSerializedStateManager> {
  return {
    id: 's2:serialized-state-manager',

    create: () => {
      const serverSideStateManager = new ServerSideStateManager();
      const clientSideStateManager = new ClientSideStateManager();

      if (serializedStates) {
        clientSideStateManager.setSerializedStates(serializedStates);
      }

      return {
        '1.0.0': (consumerId) => ({
          featureService: new SerializedStateManager(
            consumerId,
            serverSideStateManager,
            clientSideStateManager
          ),
        }),
      };
    },
  };
}

/**
 * @see [[defineSerializedStateManager]] for further information.
 */
export const serializedStateManagerDefinition = defineSerializedStateManager();
