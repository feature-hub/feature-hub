---
id: integrating-the-feature-hub
title: Integrating the Feature Hub
sidebar_label: Integrating the Feature Hub
---

The [`@feature-hub/core`][core-api] package provides the following two major
building blocks:

- The `FeatureServiceRegistry` — A class for providing Feature Services to
  dependent consumers.
- The `FeatureAppManager` — A class for managing the lifecycle of Feature Apps.

There are a few steps the integrator needs to follow to compose a web page of
multiple Feature Apps that share state through Feature Services:

1. Instantiate a `FeatureServiceRegistry` singleton instance.
1. Register a set of Feature Services at the `FeatureServiceRegistry`.
1. Instantiate a `FeatureAppManager` singleton instance using the
   `FeatureServiceRegistry`.
1. Place Feature Apps on a web page, e.g. [using
   React][placing-feature-apps-on-a-web-page-using-react].

Typical integrator bootstrap code would look like this:

```js
import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {someFeatureServiceDefinition1} from './some-feature-service-1';
import {someFeatureServiceDefinition2} from './some-feature-service-2';
```

```js
const featureServiceRegistry = new FeatureServiceRegistry();

const featureServiceDefinitions = [
  someFeatureServiceDefinition1,
  someFeatureServiceDefinition2
];

featureServiceRegistry.registerFeatureServices(
  featureServiceDefinitions,
  'acme:integrator'
);

const featureAppManager = new FeatureAppManager(featureServiceRegistry);
```

> The integrator needs a self-selected but unique consumer ID to register or
> [consume Feature Services][consuming-feature-services] (in the example above
> it is `'acme:integrator'`). All [Feature Services registered together][faq-1]
> using the `registerFeatureServices` method of the `FeatureServiceRegistry` are
> automatically sorted topologically and therefore do not need to be registered
> in the correct order.

## Module Loader

For the `FeatureAppManager` to be able to load Feature Apps from a remote
location, it needs to be configured with an implementation of the `ModuleLoader`
interface of the [`@feature-hub/core`][core-api] package by the integrator (e.g.
the [`@feature-hub/module-loader-amd`][module-loader-amd-api] package or the
[`@feature-hub/module-loader-commonjs`][module-loader-commonjs-api] package).

On the client:

```js
import {loadAmdModule} from '@feature-hub/module-loader-amd';
```

```js
const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
  moduleLoader: loadAmdModule
});
```

On the server:

```js
import {loadCommonJsModule} from '@feature-hub/module-loader-commonjs';
```

```js
const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
  moduleLoader: loadCommonJsModule
});
```

### Validating Externals

When using a module loader, it might make sense to validate external
dependencies that are [required by Feature Apps][feature-app-dependencies]
against the externals, e.g. [shared npm dependencies][sharing-npm-dependencies],
that are provided by the integrator. This makes it possible that an error is
already thrown when creating a Feature App with incompatible external
dependencies, and thus enables early feedback as to whether a Feature App is
compatible with the integration environment.

To accomplish that the integrator can configure an `ExternalsValidator`.

On the client:

```js
import {
  ExternalsValidator,
  FeatureAppManager,
  FeatureServiceRegistry
} from '@feature-hub/core';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import * as React from 'react';
```

```js
defineExternals({react: React});

const externalsValidator = new ExternalsValidator({react: '16.7.0'});
const featureServiceRegistry = new FeatureServiceRegistry();

const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
  moduleLoader: loadAmdModule,
  externalsValidator
});
```

On the server:

```js
import {
  ExternalsValidator,
  FeatureAppManager,
  FeatureServiceRegistry
} from '@feature-hub/core';
import {loadCommonJsModule} from '@feature-hub/module-loader-commonjs';
```

```js
const externalsValidator = new ExternalsValidator({react: '16.7.0'});
const featureServiceRegistry = new FeatureServiceRegistry();

const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
  moduleLoader: loadCommonJsModule,
  externalsValidator
});
```

The `ExternalsValidator` can also be passed to the `FeatureServiceRegistry` to
validate the [external dependencies of Feature
Services][feature-service-dependencies] that are [provided by Feature
Apps][own-feature-service-definitions] that are loaded from a remote location,
instead of being provided by the integrator.

On the client/server:

```js
const featureServiceRegistry = new FeatureServiceRegistry({externalsValidator});
```

## Placing Feature Apps on a Web Page Using React

An integrator can use the `FeatureAppLoader` or the `FeatureAppContainer` (both
from the [`@feature-hub/react`][react-api] package) to place Feature Apps on a
web page that have been [implemented using
React][implementing-a-feature-app-using-react]. Each of them access the
`FeatureAppManager` singleton instance through React context. To provide the
context, the integrator must render a `FeatureHubContextProvider`:

```js
import {FeatureHubContextProvider} from '@feature-hub/react';
```

```jsx
<FeatureHubContextProvider value={{featureAppManager}}>
  {/* render Feature Apps here */}
</FeatureHubContextProvider>
```

### React Feature App Loader

The `FeatureAppLoader` component allows the integrator to load Feature Apps from
a remote location.

#### `src`

A Feature App can be loaded and integrated by defining a `src` which is the URL
of its client module bundle:

```js
import {FeatureAppLoader} from '@feature-hub/react';
```

```jsx
<FeatureAppLoader src="https://example.com/some-feature-app.js" />
```

> If the integrator has configured the AMD module loader on the client, the
> Feature App to be loaded via `src` must be provided as an [AMD module][amd].

#### `serverSrc`

Additionally, when a Feature App needs to be rendered on the server, its
`serverSrc` must be specified, which is the URL of its server module bundle:

```jsx
<FeatureAppLoader
  src="https://example.com/some-feature-app.js"
  serverSrc="https://example.com/some-feature-app-node.js"
/>
```

> If the integrator has configured the CommonJS module loader on the server, the
> Feature App to be loaded via `serverSrc` must be provided as a CommonJS
> module.

#### `css`

You can also define a `css` prop to add stylesheets to the document:

```jsx
<FeatureAppLoader
  src="https://example.com/some-feature-app.js"
  css={[
    {href: 'https://example.com/some-feature-app.css'},
    {href: 'https://example.com/some-feature-app-print.css', media: 'print'}
  ]}
/>
```

#### `idSpecifier`

If multiple instances of the same Feature App are placed on a single web page,
an `idSpecifier` that is unique for the Feature App ID must be defined by the
integrator:

```jsx
<section>
  <div>
    <FeatureAppLoader
      src="https://example.com/some-feature-app.js"
      idSpecifier="main"
    />
  </div>
  <aside>
    <FeatureAppLoader
      src="https://example.com/some-feature-app.js"
      idSpecifier="aside"
    />
  </aside>
</section>
```

### React Feature App Container

The `FeatureAppContainer` component allows the integrator to bundle Feature Apps
instead of loading them from a remote location.

#### `featureAppDefinition`

A Feature App can be integrated by directly providing its
`featureAppDefinition`:

```js
import {FeatureAppContainer} from '@feature-hub/react';
import {someFeatureAppDefinition} from './some-feature-app';
```

```jsx
<FeatureAppContainer featureAppDefinition={someFeatureAppDefinition} />
```

#### `idSpecifier`

If multiple instances of the same Feature App are placed on a single web page,
an `idSpecifier` that is unique for the Feature App ID must be defined by the
integrator:

```jsx
<section>
  <div>
    <FeatureAppContainer
      featureAppDefinition={someFeatureAppDefinition}
      idSpecifier="main"
    />
  </div>
  <aside>
    <FeatureAppContainer
      featureAppDefinition={someFeatureAppDefinition}
      idSpecifier="aside"
    />
  </aside>
</section>
```

## Providing Configs

The integrator can provide config objects for Feature Services and Feature Apps,
associated with their respective IDs, via the `FeatureServiceRegistry` and
`FeatureAppManager`:

```js
const featureServiceConfigs = {'acme:some-feature-service': {foo: 'bar'}};
const featureAppConfigs = {'acme:some-feature-app': {baz: 'qux'}};

const featureServiceRegistry = new FeatureServiceRegistry({
  configs: featureServiceConfigs
});

const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
  configs: featureAppConfigs
});
```

Feature Services and Feature Apps can then use their respective config object as
follows:

```js
const someFeatureServiceDefinition = {
  id: 'acme:some-feature-service',

  create(env) {
    const {foo} = env.config; // foo is 'bar'

    // ...
  }
};
```

```js
const someFeatureAppDefinition = {
  id: 'acme:some-feature-app',

  create(env) {
    const {baz} = env.config; // baz is 'qux'

    // ...
  }
};
```

## Consuming Feature Services

Just like Feature Apps or Feature Services, the integrator itself can consume
its own registered Feature Services. To do this, the integrator needs to define
a consumer definition object for itself. Besides the self-selected but unique
consumer `id`, this consumer definition object contains a `dependencies` object.
The required Feature Services can then be instantiated (bound) using the
`bindFeatureServices` method of the `FeatureServiceRegistry`:

```js
import {FeatureServiceRegistry} from '@feature-hub/core';
import {someFeatureServiceDefinition1} from './some-feature-service-1';
import {someFeatureServiceDefinition2} from './some-feature-service-2';
```

```js
const integratorDefinition = {
  id: 'acme:integrator',
  dependencies: {
    featureServices: {
      [someFeatureServiceDefinition2.id]: '^1.0.0'
    }
  }
};

const featureServiceRegistry = new FeatureServiceRegistry();

const featureServiceDefinitions = [
  someFeatureServiceDefinition1,
  someFeatureServiceDefinition2
];

featureServiceRegistry.registerFeatureServices(
  featureServiceDefinitions,
  integratorDefinition.id
);

const {featureServices} = featureServiceRegistry.bindFeatureServices(
  integratorDefinition
);

const someFeatureService2 = featureServices[someFeatureServiceDefinition2.id];

someFeatureService2.foo(42);
```

[amd]: https://github.com/amdjs/amdjs-api/blob/master/AMD.md
[core-api]: /@feature-hub/core/
[react-api]: /@feature-hub/react/
[consuming-feature-services]:
  /docs/guides/integrating-the-feature-hub#consuming-feature-services
[faq-1]: /docs/help/faq#can-the-integrator-register-feature-services-one-by-one
[implementing-a-feature-app-using-react]:
  /docs/guides/writing-a-feature-app#implementing-a-feature-app-using-react
[sharing-npm-dependencies]: /docs/guides/sharing-npm-dependencies
[module-loader-amd-api]: /@feature-hub/module-loader-amd/
[module-loader-commonjs-api]: /@feature-hub/module-loader-commonjs/
[placing-feature-apps-on-a-web-page-using-react]:
  /docs/guides/integrating-the-feature-hub#placing-feature-apps-on-a-web-page-using-react
[own-feature-service-definitions]:
  /docs/guides/writing-a-feature-app#ownfeatureservicedefinitions
[feature-app-dependencies]: /docs/guides/writing-a-feature-app#dependencies
[feature-service-dependencies]:
  /docs/guides/writing-a-feature-service#dependencies
