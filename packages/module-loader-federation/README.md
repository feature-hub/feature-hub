# @feature-hub/module-loader-federation

[![Package Version][package-badge]][package-npm]
[![Website][website-badge]][website] [![API][api-badge]][api]

A `FeatureAppManager`-compatible Module Federation loader.

## Installation

### Using npm

```sh
npm install @feature-hub/module-loader-federation
```

## `loadFederatedModule` (webpack)

The original loader. Injects a script tag, reads the global container named
`__feature_hub_feature_app_module_container__`, and shares modules through
webpack's `__webpack_share_scopes__.default`. Both the remote and the integrator
must be webpack builds using the built-in
`webpack.container.ModuleFederationPlugin`; the remote must expose a
`featureAppModule` under that container name.

```js
const {featureAppManager} = createFeatureHub('acme:integrator', {
  moduleLoader: loadFederatedModule,
});
```

This loader is unchanged from previous versions — existing consumers do not need
to migrate.

## `loadFederationModule` (MF2 runtime)

Uses [`@module-federation/enhanced/runtime`][mf-enhanced-runtime] under the hood
and works with any bundler that emits a Module Federation 2 (MF2) compatible
container — webpack 5, Rspack, or Vite via [`@module-federation/vite`][mf-vite].

```js
const {featureAppManager} = createFeatureHub('acme:integrator', {
  moduleLoader: loadFederationModule,
});
```

The URL it loads points at the remote's MF2 manifest, and names the module to
load in its fragment:

```
http://localhost:3000/remotes/mf-manifest.json#feature/two
```

The React and Web Component Feature App loaders build this URL from their `src`
and `exposedModule`, so a `src` must not already have a fragment. Anything that
hands the `FeatureAppManager` a URL directly, e.g. to preload a Feature App,
writes the fragment itself.

### The manifest is the source of truth

The remote must publish an MF2 manifest. `@module-federation/enhanced`'s
`ModuleFederationPlugin` and `@module-federation/vite` both emit
`mf-manifest.json` next to the remote entry by default, so this usually needs no
build change. The manifest declares the remote's `name`, the modules it
`exposes`, and its entry file and library type, so:

- **The remote name is never written by the integrator** and cannot drift from
  the name the remote was actually built with.
- **The entry file is never guessed** — it is resolved from the manifest's
  `metaData.remoteEntry` against its `publicPath`. Manifests that compute their
  public path at runtime (`getPublicPath`) are not supported.
- **`moduleType` is unnecessary** — the loader reads the entry's library type
  from the manifest (see [Entry type](#entry-type)).

The URL is either the manifest itself — any path ending in `.json`, whatever the
file is called — or the folder that holds it, in which case `mf-manifest.json`
is appended. `http://localhost:3000/remotes`, `http://localhost:3000/remotes/`
and `http://localhost:3000/remotes/mf-manifest.json` are equivalent. Point it at
the manifest or its folder, never at the remote entry (`remoteEntry.js`).

The manifest is fetched once per URL and shared by every Feature App that comes
from it. A failed fetch is not cached, so the next load retries it.

### The exposed module is required

The exposed module is always required, even when the remote exposes only one. It
is never inferred, so a remote that later exposes more modules cannot break a
host that relied on the single one. Nested expose keys work as written:
`#feature/one` loads the remote's `./feature/one`. A missing or mistyped module
fails before anything is loaded, and the error lists the modules the remote
exposes.

Renaming an exposed module breaks every host that names it. To rename without a
coordinated release, have the remote expose the same file under both the old and
the new key until the hosts have moved over.

### Remotes that share a name

The MF2 runtime registers a remote by name alone, and keeps the first
registration for a name. Registered under their built `name`, two remotes that
share one, e.g. after a remote is rebuilt with another remote's name, would both
load the first one's code.

So the loader registers each remote under its built name plus a hash of its
entry URL, e.g. `feature_apps@2b7e9f1a`. Feature Apps from the same remote share
one registration, and remotes served from different entries never collide, even
when they were built with the same name.

This is verified for `module` remotes such as those built with
`@module-federation/vite`: two remotes with the same name load side by side,
each with its own code and with shared singletons such as React still shared. A
`var` or `global` remote also assigns its container to a global named after its
build (`metaData.globalName`), so two of those with the same name still
overwrite each other's global. Keep the names of such remotes unique.

### Entry type

The remote entry type (`module`, `var`, `esm`, …) comes from the manifest's
`metaData.remoteEntry.type`, which is the library type the remote was built
with. Pass a `moduleType` only to override it, e.g. `var` for a webpack `var`
container whose manifest says otherwise.

### Host setup

The host (integrator) must initialize the same MF2 runtime, so build it with a
federation plugin — `@module-federation/vite` or `@module-federation/enhanced`'s
`ModuleFederationPlugin`. Both emit a virtual module that calls the MF2
runtime's `init()` automatically when the host bundle loads, which is what lets
shared singletons be deduplicated across the boundary. A plain
`webpack.container.ModuleFederationPlugin` host does **not** initialize this
runtime — use `loadFederatedModule` in that case.

---

Copyright (c) 2021-2024 Accenture Song Build Germany GmbH. Released under the
terms of the [MIT License][license].

[api]: https://feature-hub.io/@feature-hub/module-loader-federation/
[api-badge]:
  https://img.shields.io/badge/API-%40feature--hub%2Fmodule--loader--federation-%23ea3458.svg
[license]: https://github.com/feature-hub/feature-hub/blob/main/LICENSE
[mf-enhanced-runtime]: https://www.npmjs.com/package/@module-federation/enhanced
[mf-vite]: https://github.com/module-federation/vite
[package-badge]:
  https://img.shields.io/npm/v/@feature-hub/module-loader-federation.svg
[package-npm]:
  https://www.npmjs.com/package/@feature-hub/module-loader-federation
[website]: https://feature-hub.io/
[website-badge]:
  https://img.shields.io/badge/Website-feature--hub.io-%23500dc5.svg
