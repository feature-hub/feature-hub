export type Effect<TResult> = () => Promise<TResult>;

class MonitorablePromise<TResult> {
  public readonly promise: Promise<TResult>;

  public pending = true;

  public constructor(promise: Promise<TResult>) {
    this.promise = (async () => {
      try {
        return await promise;
      } finally {
        this.pending = false;
      }
    })();
  }
}

const queueMicroTask = process.nextTick.bind(process);
const queueMacroTask = setImmediate;

export async function useFakeTimers<TResult>(
  effect: Effect<TResult>,
  expectedTimeoutInMilliseconds?: number
): Promise<TResult> {
  jest.useFakeTimers();

  try {
    const result = new MonitorablePromise(effect());

    let actualTimeoutInMilliseconds = 0;

    while (result.pending) {
      await new Promise<void>(resolve => queueMacroTask(resolve));

      jest.runAllTicks();
      jest.runAllImmediates();
      jest.advanceTimersByTime(1);

      actualTimeoutInMilliseconds += 1;

      await new Promise<void>(resolve => queueMicroTask(resolve));
    }

    if (typeof expectedTimeoutInMilliseconds === 'number') {
      expect(actualTimeoutInMilliseconds).toBe(expectedTimeoutInMilliseconds);
    }

    return result.promise;
  } finally {
    jest.useRealTimers();
  }
}
