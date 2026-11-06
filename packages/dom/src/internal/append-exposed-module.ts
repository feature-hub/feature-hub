/**
 * Appends the module to expose from a Module Federation manifest as the URL
 * fragment that `loadFederationModule` reads, so the integrator never writes
 * the fragment by hand.
 */
export function appendExposedModule(
  url: string,
  exposedModule: string | undefined,
): string {
  if (!exposedModule) {
    return url;
  }

  if (url.includes('#')) {
    throw new Error(
      `Cannot apply the exposedModule ${JSON.stringify(exposedModule)} to the URL ${JSON.stringify(url)}, which already has a fragment. Use one or the other.`,
    );
  }

  return `${url}#${exposedModule}`;
}
