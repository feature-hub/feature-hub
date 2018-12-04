export function debounceAsync(
  fn: () => void,
  wait: number
): () => Promise<void> {
  let resolves: (() => void)[] = [];
  let timeoutId: NodeJS.Timer | undefined;

  return async () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      fn();

      for (const resolve of resolves) {
        resolve();
      }

      resolves = [];
    }, wait);

    return new Promise<void>(resolve => resolves.push(resolve));
  };
}
