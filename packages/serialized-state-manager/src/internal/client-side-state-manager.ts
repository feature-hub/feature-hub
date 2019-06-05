export class ClientSideStateManager {
  private serializedStatesByConsumerId?: Record<string, string | undefined>;

  public setSerializedStates(serializedStates: string): void {
    this.serializedStatesByConsumerId = JSON.parse(decodeURI(serializedStates));
  }

  public getSerializedState(consumerId: string): string | undefined {
    return (
      this.serializedStatesByConsumerId &&
      this.serializedStatesByConsumerId[consumerId]
    );
  }
}
