export class ServerSideStateManager {
  private readonly serializeStateCallbacks = new Map<string, () => string>();

  public register(consumerUid: string, serializeState: () => string): void {
    this.serializeStateCallbacks.set(consumerUid, serializeState);
  }

  public serializeStates(): string {
    const serializedStateByConsumerUid: Record<string, string> = {};

    this.serializeStateCallbacks.forEach(
      (createSerializedState, currentConsumerUid) => {
        serializedStateByConsumerUid[
          currentConsumerUid
        ] = createSerializedState();
      }
    );

    return encodeURI(JSON.stringify(serializedStateByConsumerUid));
  }
}
