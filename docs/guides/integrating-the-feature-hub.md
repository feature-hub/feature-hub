---
id: integrating-the-feature-hub
title: Integrating the Feature Hub
sidebar_label: Integrating the Feature Hub
---

The `@feature-hub/core` package provides the following two major building
blocks:

- The `FeatureServiceRegistry`: A class for providing Feature Services to
  dependent consumers.
- The `FeatureAppManager`: A class for managing the lifecycle of Feature Apps.

There are a few steps the integrator needs to follow to compose a web page of
multiple Feature Apps that share state through Feature Services:

1.  Instantiate a `FeatureServiceRegistry` singleton instance.
1.  Register a set of Feature Services at the `FeatureServiceRegistry`.
1.  Instantiate a `FeatureAppManager` singleton instance using the
    `FeatureServiceRegistry`.

A typical integrator bootstrap code would look like this:

```js
import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
```

```js
const registry = new FeatureServiceRegistry();

const featureServiceDefinitions = [
  sampleFeatureServiceDefinition1, // import definitions from somewhere
  sampleFeatureServiceDefinition2
];

registry.registerProviders(featureServiceDefinitions, 'integrator');

const manager = new FeatureAppManager(registry);
```

A React integrator can then use the React `FeatureAppLoader` or the React
`FeatureAppContainer` (both from the `@feature-hub/react` package) to place
Feature Apps onto the web page. Each of them need the `FeatureAppManager`
singleton instance to render their Feature App.

## Module Loader

For the `FeatureAppManager` or React `FeatureAppLoader` to be able to load
Feature Apps from a remote location, it needs a module loader configured by the
integrator (e.g. from the `@feature-hub/module-loader` package).

In the browser:

```js
import {loadAmdModule} from '@feature-hub/module-loader';
```

```js
const manager = new FeatureAppManager(registry, {moduleLoader: loadAmdModule});
```

On the server:

```js
import {loadCommonJsModule} from '@feature-hub/module-loader';
```

```js
const manager = new FeatureAppManager(registry, {
  moduleLoader: loadCommonJsModule
});
```

## React `FeatureAppLoader`

The React `FeatureAppLoader` allows the integrator to load Feature Apps from a
remote location.

### `src`

A Feature App can be loaded and rendered by defining a `src` which is the URL to
its module bundle, e.g.:

```js
import {FeatureAppLoader} from '@feature-hub/react';
```

```jsx
<FeatureAppLoader
  manager={manager}
  src="https://example.com/my-feature-app.js"
/>
```

**Note:** If the integrator has configured the AMD module loader in the browser,
the Feature App to be loaded via `src` must be provided as an [AMD][amd] module.

### `nodeSrc`

Additionally, when a Feature App wants to be rendered on the server, its
`nodeSrc` must be specified, which is the URL to its module bundle, e.g.:

```jsx
<FeatureAppLoader
  manager={manager}
  src="https://example.com/my-feature-app.js"
  nodeSrc="https://example.com/my-feature-app-node.js"
/>
```

**Note:** If the integrator has configured the CommonJS module loader on the
server, the Feature App to be loaded via `nodeSrc` must be provided as a
CommonJS module.

### `css`

You can also define a `css` prop to add stylesheets to the document:

```jsx
<FeatureAppLoader
  manager={manager}
  src="https://example.com/my-feature-app.js"
  css={[
    {href: 'https://example.com/my-feature-app.css'},
    {href: 'https://example.com/my-feature-app-print.css', media: 'print'}
  ]}
/>
```

### `idSpecifier`

If multiple instances of the same Feature App must be placed onto a single page,
an `idSpecifier` that is unique for the Feature App ID must be defined by the
integrator, e.g.:

```jsx
<section>
  <div>
    <FeatureAppLoader
      manager={manager}
      src="https://example.com/my-feature-app.js"
      idSpecifier="main"
    />
  </div>
  <aside>
    <FeatureAppLoader
      manager={manager}
      src="https://example.com/my-feature-app.js"
      idSpecifier="aside"
    />
  </aside>
</section>
```

## React `FeatureAppContainer`

The React `FeatureAppContainer` allows the integrator to bundle Feature Apps
instead of loading them from a remote location.

### `featureAppDefinition`

A Feature App can be rendered by directly providing its `featureAppDefinition`:

```js
import {FeatureAppContainer} from '@feature-hub/react';
import {myFeatureAppDefinition} from './my-feature-app';
```

```jsx
<FeatureAppContainer
  manager={manager}
  featureAppDefinition={myFeatureAppDefinition}
/>
```

### `idSpecifier`

If multiple instances of the same Feature App must be placed onto a single page,
an `idSpecifier` that is unique for the Feature App ID must be defined by the
integrator, e.g.:

```jsx
<section>
  <div>
    <FeatureAppContainer
      manager={manager}
      featureAppDefinition={myFeatureAppDefinition}
      idSpecifier="main"
    />
  </div>
  <aside>
    <FeatureAppContainer
      manager={manager}
      featureAppDefinition={myFeatureAppDefinition}
      idSpecifier="aside"
    />
  </aside>
</section>
```

## Config Provision

The integrator can provide config objects for Feature Services and Feature Apps,
associated by their respective IDs, via the `FeatureServiceRegistry` and
`FeatureAppManager`:

```js
const featureServiceConfigs = {'acme:my-feature-service': {foo: 'bar'}};
const featureAppConfigs = {'acme:my-feature-app': {baz: 'qux'}};

const registry = new FeatureServiceRegistry({configs: featureServiceConfigs});
const manager = new FeatureAppManager(registry, {configs: featureAppConfigs});
```

Feature Services and Feature Apps can then use their respective config object as
follows:

```js
const myFeatureServiceDefinition = {
  id: 'acme:my-feature-service',

  create(env) {
    const {foo} = env.config; // foo is 'bar'

    // ...
  }
};
```

```js
const myFeatureAppDefinition = {
  id: 'acme:my-feature-app',

  create(env) {
    const {baz} = env.config; // baz is 'qux'

    // ...
  }
};
```

[amd]: https://github.com/amdjs/amdjs-api/blob/master/AMD.md
