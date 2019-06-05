import {SerializedStateManagerV1} from '..';
import {ClientSideStateManager} from './client-side-state-manager';
import {ServerSideStateManager} from './server-side-state-manager';

export class SerializedStateManager implements SerializedStateManagerV1 {
  public constructor(
    private readonly consumerId: string,
    private readonly serverSideStateManager: ServerSideStateManager,
    private readonly clientSideStateManager: ClientSideStateManager
  ) {}

  public register(serializeState: () => string): void {
    this.serverSideStateManager.register(this.consumerId, serializeState);
  }

  public serializeStates(): string {
    return this.serverSideStateManager.serializeStates();
  }

  public setSerializedStates(serializedStates: string): void {
    this.clientSideStateManager.setSerializedStates(serializedStates);
  }

  public getSerializedState(): string | undefined {
    return this.clientSideStateManager.getSerializedState(this.consumerId);
  }
}
