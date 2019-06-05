export class ServerSideStateManager {
  private readonly serializeStateCallbacks = new Map<string, () => string>();

  public register(consumerId: string, serializeState: () => string): void {
    this.serializeStateCallbacks.set(consumerId, serializeState);
  }

  public serializeStates(): string {
    const serializedStatesByConsumerId: Record<string, string> = {};

    this.serializeStateCallbacks.forEach(
      (serializeState, currentConsumerId) => {
        serializedStatesByConsumerId[currentConsumerId] = serializeState();
      }
    );

    return encodeURI(JSON.stringify(serializedStatesByConsumerId));
  }
}
