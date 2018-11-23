export class AsyncValue<TValue> {
  public constructor(
    public readonly promise: Promise<TValue>,
    public value?: TValue,
    public error?: Error
  ) {
    promise.then(val => (this.value = val)).catch(err => (this.error = err));
  }
}
