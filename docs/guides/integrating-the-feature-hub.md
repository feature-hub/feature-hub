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
1.  Instantiate a `FeatureAppManager` singleton instance with the
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

A React integrator can then use the `FeatureAppLoader` or the
`FeatureAppContainer` (both from the `@feature-hub/react` package) to place
Feature Apps onto the web page. Each of them need the `FeatureAppManager`
singleton instance to render their Feature App.

## Loading Feature Apps

With the React `FeatureAppLoader` a Feature App can be loaded and rendered by
defining a `src` which is the URL to its JavaScript [UMD][umd] bundle, e.g.:

```js
import {FeatureAppLoader} from '@feature-hub/react';
```

```jsx
<FeatureAppLoader
  manager={manager}
  src="https://example.com/my-feature-app.js"
/>
```

Additionally, when a Feature App wants to be rendered on the server, its
`nodeSrc` must be specified, which is the URL to its CommonJS bundle (targeted
at Node.js):

```jsx
<FeatureAppLoader
  manager={manager}
  src="https://example.com/my-feature-app.js"
  nodeSrc="https://example.com/my-feature-app-node.js"
/>
```

**Note:** Server-side rendering of Feature Apps is not fully supported yet.

You can also define a `css` prop to add stylesheets to the document.

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

If multiple instances of the same Feature App must be placed onto a single page,
a `idSpecifier` that is unique for the Feature App `id` must be defined by the
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

## Bundling Feature Apps

With the React `FeatureAppContainer` a Feature App can be rendered by directly
providing its Feature App definition:

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

This allows the integrator to bundle Feature Apps, instead of loading them from
a remote location.

If multiple instances of the same Feature App must be placed onto a single page,
a `idSpecifier` that is unique for the Feature App `id` must be defined by the
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

## Providing Config Objects

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

[umd]: https://github.com/umdjs/umd
