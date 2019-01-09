export async function setTimeoutAsync(duration: number): Promise<void> {
  return new Promise<void>((resolve: () => void) =>
    setTimeout(resolve, duration)
  );
}
