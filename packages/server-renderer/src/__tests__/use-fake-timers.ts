export type Effect<TResult> = () => Promise<TResult>;

class ObservablePromise<TResult> {
  public readonly promise: Promise<TResult>;

  private _pending = true;

  public constructor(promise: Promise<TResult>) {
    this.promise = (async () => {
      try {
        return await promise;
      } finally {
        this._pending = false;
      }
    })();
  }

  public async isPending(): Promise<boolean> {
    for (let i = 0; i < 25; i += 1) {
      await Promise.resolve();
    }

    return this._pending;
  }
}

export async function useFakeTimers<TResult>(
  effect: Effect<TResult>,
  expectedTimeoutInMilliseconds?: number
): Promise<TResult> {
  jest.useFakeTimers();

  try {
    const result = new ObservablePromise(effect());

    let actualTimeoutInMilliseconds = 0;

    while (await result.isPending()) {
      jest.runAllTicks();
      jest.runAllImmediates();
      jest.advanceTimersByTime(1);

      actualTimeoutInMilliseconds += 1;
    }

    if (expectedTimeoutInMilliseconds !== undefined) {
      expect(actualTimeoutInMilliseconds).toBe(expectedTimeoutInMilliseconds);
    }

    return result.promise;
  } finally {
    jest.useRealTimers();
  }
}
