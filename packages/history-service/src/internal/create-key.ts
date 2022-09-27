// source: https://github.com/remix-run/history/blob/485ebc1/packages/history/index.ts#L1043
export function createKey(): string {
  return Math.random().toString(36).slice(2, 8);
}
