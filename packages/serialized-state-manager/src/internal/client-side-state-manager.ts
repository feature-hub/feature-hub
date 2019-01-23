export class ClientSideStateManager {
  private serializedStatesByConsumerUid?: Record<string, string | undefined>;

  public setSerializedStates(serializedStates: string): void {
    this.serializedStatesByConsumerUid = JSON.parse(
      decodeURI(serializedStates)
    );
  }

  public getSerializedState(consumerUid: string): string | undefined {
    return (
      this.serializedStatesByConsumerUid &&
      this.serializedStatesByConsumerUid[consumerUid]
    );
  }
}
