import {loadRemote, registerRemotes} from '@module-federation/enhanced/runtime';
import type {RemoteEntryType} from '@module-federation/sdk';
import {parseModuleUrl} from './parse-module-url';
import {resolveRemoteFromManifest} from './resolve-manifest';

/**
 * Loads a Feature App that was built as a Module Federation 2 remote, using
 * `@module-federation/enhanced/runtime` under the hood. Works with any bundler
 * that emits an MF2 manifest (webpack 5, Rspack, Vite via
 * `@module-federation/vite`, …).
 *
 * The host (integrator) must initialize the same MF2 runtime — build it with
 * `@module-federation/enhanced`'s `ModuleFederationPlugin` or
 * `@module-federation/vite` so shared singletons are deduplicated across the
 * boundary. Webpack integrators using the built-in
 * `webpack.container.ModuleFederationPlugin` should use `loadFederatedModule`
 * instead.
 *
 * @param url The absolute URL of the remote's MF2 manifest, e.g.
 * `https://example.com/remotes/mf-manifest.json`. The manifest names the remote
 * and its entry file.
 *
 * @param moduleType The remote entry type (`module`, `var`, `esm`, …), forwarded
 * by the `FeatureAppManager`. Overrides the library type the manifest declares;
 * when omitted, the manifest's `metaData.remoteEntry.type` is used.
 *
 * @returns A promise that resolves with the loaded module, or is rejected if
 * the module can not be loaded.
 */
export async function loadFederationModule(
  url: string,
  moduleType?: string,
): Promise<unknown> {
  const {manifestURL, exposedModule} = parseModuleUrl(url);

  const remote = await resolveRemoteFromManifest(manifestURL, exposedModule);

  // The MF2 runtime ignores a second remote registered under an existing name,
  // so two remotes built with the same name would both load the first one's
  // code. Adding a hash of the entry URL keeps them apart.
  const hashUrl = [...remote.remoteEntryURL]
    .reduce((h, c) => (h * 31 + (c.codePointAt(0) ?? 0)) % 1_000_000_007, 0)
    .toString(16);
  const name = `${remote.remoteName}@${hashUrl}`;

  registerRemotes([
    {
      name,
      entry: remote.remoteEntryURL,
      entryGlobalName: remote.remoteGlobalName,
      type: (moduleType ?? remote.remoteEntryType) as RemoteEntryType,
    },
  ]);

  return loadRemote(`${name}/${remote.exposedModule}`);
}
