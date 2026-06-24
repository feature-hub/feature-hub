export class ClientSideStateManager {
  private serializedStatesByConsumerId?: Record<string, string | undefined>;

  public setSerializedStates(serializedStates: string): void {
    this.serializedStatesByConsumerId = JSON.parse(decodeURI(serializedStates));
  }

  public getSerializedState(consumerId: string): string | undefined {
    return (
      // biome-ignore lint/complexity/useOptionalChain: legacy implementation
      this.serializedStatesByConsumerId &&
      this.serializedStatesByConsumerId[consumerId]
    );
  }
}
