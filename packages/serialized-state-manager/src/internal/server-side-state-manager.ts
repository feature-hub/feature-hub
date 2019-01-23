export class ServerSideStateManager {
  private readonly serializeStateCallbacks = new Map<string, () => string>();

  public register(consumerUid: string, serializeState: () => string): void {
    this.serializeStateCallbacks.set(consumerUid, serializeState);
  }

  public serializeStates(): string {
    const serializedStatesByConsumerUid: Record<string, string> = {};

    this.serializeStateCallbacks.forEach(
      (serializeState, currentConsumerUid) => {
        serializedStatesByConsumerUid[currentConsumerUid] = serializeState();
      }
    );

    return encodeURI(JSON.stringify(serializedStatesByConsumerUid));
  }
}
