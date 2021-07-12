---
id: sharing-npm-dependencies
title: Sharing npm Dependencies
sidebar_label: Sharing npm Dependencies
---

The integrator might want to share commonly used libraries with Feature Apps for
two reasons.

1. Reduce the bundle size of the Feature Apps by omitting shared dependencies
   from their bundle.
1. Ensure that a library that can only exist once on a page is provided as a
   singleton.

How dependencies are shared depends on the [provided module loaders of the
integrator][module-loader].

## AMD

> The feature described in this section is also demonstrated in the ["AMD Module
> Loader" demo][amd-module-loader-demo].

### Integrator

When using the [`@feature-hub/module-loader-amd`][module-loader-amd-api]
package, the integrator can provide shared npm dependencies to Feature Apps
using the `defineExternals` function:

```js
import {createFeatureHub} from '@feature-hub/core';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import * as React from 'react';
```

```js
defineExternals({react: React});

const {featureAppManager} = createFeatureHub('acme:integrator', {
  moduleLoader: loadAmdModule,
});
```

### Feature Apps

Feature Apps should define these externals in their build config. For example,
defining `react` as external in a Webpack config would look like this:

```js
module.exports = {
  // ...
  externals: {
    react: 'react',
  },
};
```

## Webpack Module Federation

> The feature described in this section is also demonstrated in the ["Webpack
> Module Federation Loader" demo][module-federation-loader-demo].

### Integrator

When using the
[`@feature-hub/module-loader-federation`][module-loader-federation-api] package,
the integrator's client module must be bundled with Webpack. The integrator can
share npm dependencies to Feature Apps using the `shared` property of its
`ModuleFederationPlugin`:

```js
module.exports = {
  // ...
  plugins: [
    new webpack.container.ModuleFederationPlugin({
      shared: {
        react: {singleton: true, eager: true},
      },
    }),
  ],
};
```

If the integrator wants to provide a shared module:

- It must be `eager` if the integrator itself consumes it synchronously.
- It does _not_ need to be `eager` if the integrator consumes it asynchronously
  (dynamic import).
- It must be a `singleton` if the module is stateful.
- It must be a `singleton` if the module can not exist more than once on a page.

There is no need for the integrator to share a module that it does not consume
itself. In this case, those Feature Apps that need it can provide the shared
module instead (see below).

### Feature Apps

If Feature Apps want to use shared dependencies, they must define them in the
`shared` property of their `ModuleFederationPlugin`.

```js
module.exports = {
  // ...
  plugins: [
    new webpack.container.ModuleFederationPlugin({
      // ...
      shared: {
        react: {singleton: true},
      },
    }),
  ],
};
```

A dependency that the integrator has provided as `singleton` must also be a
`singleton` in the Feature App's Webpack config. But here, it should _not_ be
`eager`, otherwise it will always be loaded, regardless of whether the
integrator has already provided it. Version mismatches of singletons are
generally ignored, and a warning is logged, unless `strictVersion` is set to
`true`, in which case a runtime error is thrown.

The biggest benefit of using the Module Federation Loader over the AMD Module
Loader (or in addition), is that Feature Apps can also share npm dependencies
with each other, without the need to involve the integrator.

```js
module.exports = {
  // ...
  plugins: [
    new webpack.container.ModuleFederationPlugin({
      // ...
      shared: {
        '@apollo/client': {},
      },
    }),
  ],
};
```

If a Feature App wants to provide a shared module, it should _not_ be `eager`.
In case of a version mismatch (defined by the [semver][] ranges in the
`package.json` files of the Feature Apps) the module is loaded multiple times,
and available to other Feature Apps in each loaded version.

> **Note**:  
> A large library of which only a small portion is used, might not be a good
> candidate to provide as a shared module. In this case it might be more
> efficient to include the library in each Feature App bundle, while making use
> of [Webpack's tree shaking capabilities][tree-shaking]. Furthermore, the
> loading of a library can also be deferred by using [dynamic code
> splitting][reducing-the-bundle-size].

## CommonJS

> The feature described in this section is also demonstrated in the ["CommonJS
> Module Loader" demo][commonjs-module-loader-demo].

### Integrator

On the server, when Feature Apps are [bundled as CommonJS
modules][server-bundles], the integrator either

1. needs to make sure that the externals are provided as node modules that can
   be loaded with `require()`, or

1. if the integrator code is bundled and no node modules are available during
   runtime, the integrator can provide shared npm dependencies to Feature Apps
   using the `createCommonJsModuleLoader` function of the
   [`@feature-hub/module-loader-commonjs`][module-loader-commonjs-api] package:

   ```js
   import {createFeatureHub} from '@feature-hub/core';
   import {createCommonJsModuleLoader} from '@feature-hub/module-loader-commonjs';
   import * as React from 'react';
   ```

   ```js
   const {featureAppManager} = createFeatureHub('acme:integrator', {
     moduleLoader: createCommonJsModuleLoader({react: React}),
   });
   ```

### Feature Apps

Feature Apps should define these externals in their build config. For example,
defining `react` as external in a Webpack config would look like this:

```js
module.exports = {
  // ...
  externals: {
    react: 'react',
  },
};
```

## Validating Externals

To validate the external dependencies that are [required by Feature
Apps][feature-app-dependencies] against the shared npm dependencies that are
provided by the integrator, [the `ExternalsValidator` can be
used][validating-externals].

[module-loader-amd-api]: /api/modules/module_loader_amd.html
[module-loader-commonjs-api]: /api/modules/module_loader_commonjs.html
[module-loader-federation-api]: /api/modules/module_loader_federation.html
[amd-module-loader-demo]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/module-loader-amd
[commonjs-module-loader-demo]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/module-loader-commonjs
[module-federation-loader-demo]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/module-loader-federation
[module-loader]: /docs/guides/integrating-the-feature-hub#module-loader
[reducing-the-bundle-size]: /docs/guides/reducing-the-bundle-size
[feature-app-dependencies]: /docs/guides/writing-a-feature-app#dependencies
[server-bundles]: /docs/guides/writing-a-feature-app#server-bundles
[validating-externals]:
  /docs/guides/integrating-the-feature-hub#validating-externals
[semver]: https://semver.org
[tree-shaking]: https://webpack.js.org/guides/tree-shaking/
