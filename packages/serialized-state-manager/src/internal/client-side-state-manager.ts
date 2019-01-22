export class ClientSideStateManager {
  private serializedStateByConsumerUid?: Record<string, string | undefined>;

  public setSerializedStates(serializedStates: string): void {
    this.serializedStateByConsumerUid = JSON.parse(decodeURI(serializedStates));
  }

  public getSerializedState(consumerUid: string): string | undefined {
    return (
      this.serializedStateByConsumerUid &&
      this.serializedStateByConsumerUid[consumerUid]
    );
  }
}
