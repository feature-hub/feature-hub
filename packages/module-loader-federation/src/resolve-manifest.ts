import type {Manifest} from '@module-federation/sdk';

export interface ResolvedRemote {
  remoteName: string;
  /**
   * The global the remote's entry assigns its container to, for `var`-like
   * entry types. MF2 defaults it to the remote name.
   */
  remoteGlobalName: string;
  remoteEntryURL: string;
  /** The library type the manifest declares for its entry, e.g. `module`. */
  remoteEntryType?: string;
  exposedModule: string;
}

/**
 * Resolves the entry file the manifest declares, against the manifest's public
 * path. Both come from the manifest, so the loader never guesses a file name.
 */
function resolveRemoteEntryURL(
  manifestURL: string,
  manifest: Manifest,
): string {
  const {metaData} = manifest;

  if (!metaData?.remoteEntry?.name) {
    throw new Error(
      `The Module Federation manifest at "${manifestURL}" does not declare an entry file.`,
    );
  }

  if ('getPublicPath' in metaData && metaData.getPublicPath) {
    throw new Error(
      `The Module Federation manifest at "${manifestURL}" computes its public path at runtime (getPublicPath), which the loader cannot evaluate.`,
    );
  }

  const publicPath = 'publicPath' in metaData ? metaData.publicPath : '';
  const entryFile = [metaData.remoteEntry.path, metaData.remoteEntry.name]
    .filter(Boolean)
    .join('/');

  return new URL(entryFile, new URL(publicPath, manifestURL)).href;
}

/**
 * Manifests are fetched once per URL. Several Feature Apps are routinely
 * exposed by one container, and the `FeatureAppManager` caches per Feature App
 * URL, so without this each of them would refetch the same manifest. The
 * pending promise is cached so concurrent loads share a single request, and is
 * evicted on failure so a transient error is retried rather than remembered.
 */
const manifestCache = new Map<string, Promise<Manifest>>();

async function fetchManifest(manifestURL: string): Promise<Manifest> {
  let response: Response;

  try {
    response = await fetch(manifestURL);
  } catch (error) {
    throw new Error(
      `Could not fetch the Module Federation manifest at "${manifestURL}": ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Could not fetch the Module Federation manifest at "${manifestURL}": the server responded with ${response.status}.`,
    );
  }

  let manifest: unknown;

  try {
    manifest = await response.json();
  } catch {
    throw new Error(
      `The Module Federation manifest at "${manifestURL}" is not valid JSON.`,
    );
  }

  if (!isManifest(manifest)) {
    throw new Error(
      `The Module Federation manifest at "${manifestURL}" is malformed: expected a JSON object whose \`exposes\` is a list of named modules.`,
    );
  }

  return manifest;
}

/**
 * Checks the parts of the manifest's shape that are read before any field is
 * validated on its own, so a malformed body fails with an error naming the
 * manifest rather than a bare `TypeError`.
 */
function isManifest(value: unknown): value is Manifest {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  const {exposes} = value as {exposes?: unknown};

  return (
    exposes === undefined ||
    (Array.isArray(exposes) &&
      exposes.every(
        (expose: unknown) =>
          typeof expose === 'object' &&
          expose !== null &&
          typeof (expose as {name?: unknown}).name === 'string',
      ))
  );
}

function getManifest(manifestURL: string): Promise<Manifest> {
  let manifest = manifestCache.get(manifestURL);

  if (!manifest) {
    manifest = fetchManifest(manifestURL);

    manifestCache.set(manifestURL, manifest);

    manifest.catch(() => manifestCache.delete(manifestURL));
  }

  return manifest;
}

/**
 * Resolves the remote name and exposed module from an MF2 manifest, so neither
 * has to be repeated in the Feature App URL. The name is read from the
 * manifest rather than retyped by the integrator, which means it cannot drift
 * from the name the remote was actually built with.
 *
 * @param manifestURL The absolute URL of the `mf-manifest.json`.
 *
 * @param exposedModule The exposed module to load. Required: it is never
 * inferred, even when the remote exposes a single module, so a remote that
 * later exposes more cannot change what an existing host loads.
 */
export async function resolveRemoteFromManifest(
  manifestURL: string,
  exposedModule?: string,
): Promise<ResolvedRemote> {
  const manifest = await getManifest(manifestURL);
  const remoteName = manifest.name;

  if (!remoteName) {
    throw new Error(
      `The Module Federation manifest at "${manifestURL}" does not declare a remote name.`,
    );
  }

  const remoteEntryURL = resolveRemoteEntryURL(manifestURL, manifest);
  const remoteEntryType = manifest.metaData.remoteEntry.type;
  const exposedModules = (manifest.exposes ?? []).map(({name}) => name);
  const remote = `remote "${remoteName}" at "${manifestURL}"`;

  if (exposedModules.length === 0) {
    throw new Error(
      `The ${remote} exposes no modules, so there is nothing to load.`,
    );
  }

  if (!exposedModule) {
    throw new Error(
      `No exposedModule was given for the ${remote}. Exposed modules: ${exposedModules.join(
        ', ',
      )}.`,
    );
  }

  if (!exposedModules.includes(exposedModule)) {
    throw new Error(
      `The ${remote} does not expose "${exposedModule}". Exposed modules: ${exposedModules.join(
        ', ',
      )}.`,
    );
  }

  return {
    remoteName,
    remoteGlobalName: manifest.metaData.globalName || remoteName,
    remoteEntryURL,
    remoteEntryType,
    exposedModule,
  };
}
