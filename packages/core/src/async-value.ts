export class AsyncValue<TValue> implements PromiseLike<TValue> {
  public then: Promise<TValue>['then'];

  public constructor(
    public readonly promise: Promise<TValue>,
    public value?: TValue,
    public error?: Error
  ) {
    this.then = promise.then.bind(promise) as Promise<TValue>['then'];
    promise.then(val => (this.value = val)).catch(err => (this.error = err));
  }
}
