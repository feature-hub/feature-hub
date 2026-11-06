import {ManifestFileName} from '@module-federation/sdk';

/**
 * The parsed form of the URL passed to `loadFederationModule`. The URL always
 * points at the remote's MF2 manifest; the manifest supplies the remote name
 * and the entry file.
 */
export interface ParsedModuleUrl {
  /**
   * The absolute URL of the `*.json` manifest, with any query kept.
   */
  manifestURL: string;

  /**
   * The module to load from the remote. Undefined when the URL names none,
   * which `resolveRemoteFromManifest` rejects: the module is never inferred.
   */
  exposedModule?: string;
}

function malformedUrlMessage(url: string): string {
  return `Malformed Module Federation remote URL "${url}": expected an absolute URL to an MF2 manifest (e.g. <origin>/remotes/mf-manifest.json) or to the folder that holds it (e.g. <origin>/remotes/).`;
}

/**
 * Parses the MF2 URL passed to `loadFederationModule`:
 *
 *    `<manifestURL.json>`
 *
 * The URL is either the manifest itself (a path ending in `*.json`, whatever it
 * is called), or the folder that holds the manifest, in which case MF2's
 * default manifest name is appended. The manifest names the remote and its
 * entry file, so neither is given here.
 *
 * The exposed module is carried on the URL's fragment so it can travel
 * through the module loader's single URL argument. The Feature App loaders'
 * `exposedModule` prop writes it; other callers write it themselves.
 *
 * A fragment is never sent to the server, so `manifestURL` keeps the exact path
 * and query the URL already pointed at.
 */
export function parseModuleUrl(url: string): ParsedModuleUrl {
  if (!url) {
    throw new Error('Cannot parse empty federated module URL.');
  }

  let parsed: URL;

  try {
    parsed = new URL(url);
  } catch {
    throw new Error(malformedUrlMessage(url));
  }

  const exposedModule = parsed.hash.slice(1) || undefined;

  // A `.json` path is the manifest itself, whatever it is called.
  if (parsed.pathname.endsWith('.json')) {
    return {
      manifestURL: `${parsed.origin}${parsed.pathname}${parsed.search}`,
      exposedModule,
    };
  }

  // Anything else is the folder that holds the manifest. Add the trailing
  // slash so the filename is joined to the folder, not substituted for it.
  const folder = parsed.pathname.endsWith('/')
    ? parsed.pathname
    : `${parsed.pathname}/`;

  return {
    manifestURL: `${parsed.origin}${folder}${ManifestFileName}${parsed.search}`,
    exposedModule,
  };
}
