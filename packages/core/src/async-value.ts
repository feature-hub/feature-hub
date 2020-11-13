/**
 * An `AsyncValue` provides a promise and as soon as the promise resolves or
 * rejects, also exposes the returned value or error. It is useful for
 * accessing a promise value in a synchronous context.
 */
export class AsyncValue<TValue> {
  public constructor(
    public readonly promise: Promise<TValue>,
    public value?: TValue,
    public error?: Error
  ) {
    promise
      .then((val) => (this.value = val))
      .catch((err) => (this.error = err));
  }
}
