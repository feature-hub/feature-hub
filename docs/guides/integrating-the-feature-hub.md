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
1. Place Feature Apps on a web page, e.g.
   [using React](#placing-feature-apps-on-a-web-page-using-react).

To simplify the first three steps, an integrator can use the `createFeatureHub`
function that is also provided by the [`@feature-hub/core`][core-api] package:

```js
import {createFeatureHub} from '@feature-hub/core';
import {someFeatureServiceDefinition1} from './some-feature-service-1';
import {someFeatureServiceDefinition2} from './some-feature-service-2';
```

```js
const {featureAppManager, featureServiceRegistry} = createFeatureHub(
  'acme:integrator',
  {
    featureServiceDefinitions: [
      someFeatureServiceDefinition1,
      someFeatureServiceDefinition2
    ]
  }
);
```

This creates the `FeatureServiceRegistry` singleton instance, registers all
`featureServiceDefinitions` for the given integrator ID (`'acme:integrator'`),
and instantiates a `FeatureAppManager` singleton instance using the
`FeatureServiceRegistry`. Both singletons are returned as properties of the
`FeatureHub` object created using the `createFeatureHub` function.

> **Note:**  
> The integrator needs a self-selected but unique consumer ID to register or
> [consume Feature Services](#consuming-feature-services) (in the example above
> it is `'acme:integrator'`). The `featureServiceDefinitions` are automatically
> sorted topologically before being registered, and therefore do not need to be
> passed in the correct order.

## Choosing an Integrator Technology

The Feature Hub allows for different technology choices for the integrator as
well as for Feature Apps supported by the integrator. While it is possible to
build a custom solution tailored to the UI frameworks or libraries of choice
using the primitives provided by the [`@feature-hub/core`][core-api] package,
the [`@feature-hub/react`][react-api] and [`@feature-hub/dom`][dom-api] package
provide out-of-the-box solutions for building an integrator.

The [`@feature-hub/dom`][dom-api] package uses Web Components as a basis. It
wraps Feature Apps into a shadow DOM and doesn't rely on the presence of any big
frontend frameworks, which makes it possible to build integrators that are lean
in bundle size. Feature Apps can be build using any technology since they just
have to render themselves into a provided DOM element.

The [`@feature-hub/react`][react-api] package on the other hand allows for
building an integrator using React. It has the capability to render Feature Apps
which are also build using React on the server as well as on the client, while
it can still integrate Feature Apps that are built using other technologies on
the client.

|                                        | @feature-hub/react |                 | @feature-hub/dom |
| -------------------------------------- | ------------------ | --------------- | ---------------- |
| **Feature App Type**                   | `ReactFeatureApp`  | `DomFeatureApp` | `DomFeatureApp`  |
| **Universal SSR**                      | ✅                 | ❌              | ❌               |
| **Built-In Shadow DOM**                | ❌                 | ❌              | ✅               |
| **Required Integrator UI Library**     | `react@^16.3.0`    | `react@^16.3.0` | ✅ None          |
| **Supported Feature App UI Libraries** | `react@^16.3.0`    | ✅ Any          | ✅ Any           |

## Module Loader

For the `FeatureAppManager` to be able to load Feature Apps from a remote
location, it needs to be configured with an implementation of the `ModuleLoader`
interface of the [`@feature-hub/core`][core-api] package by the integrator (e.g.
the [`@feature-hub/module-loader-amd`][module-loader-amd-api] package or the
[`@feature-hub/module-loader-commonjs`][module-loader-commonjs-api] package).

The module loader can be provided with the `moduleLoader` option of the
`createFeatureHub` function.

On the client:

```js
import {loadAmdModule} from '@feature-hub/module-loader-amd';
```

```js
const {featureAppManager} = createFeatureHub('acme:integrator', {
  moduleLoader: loadAmdModule
});
```

On the server:

```js
import {loadCommonJsModule} from '@feature-hub/module-loader-commonjs';
```

```js
const {featureAppManager} = createFeatureHub('acme:integrator', {
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

To accomplish that, the integrator can pass the `providedExternals` option to
the `createFeatureHub` function.

On the client:

```js
import {createFeatureHub} from '@feature-hub/core';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import * as React from 'react';
```

```js
defineExternals({react: React});

const {featureAppManager} = createFeatureHub('acme:integrator', {
  moduleLoader: loadAmdModule,
  providedExternals: {react: '16.7.0'}
});
```

On the server:

```js
import {createFeatureHub} from '@feature-hub/core';
import {loadCommonJsModule} from '@feature-hub/module-loader-commonjs';
```

```js
const {featureAppManager} = createFeatureHub('acme:integrator', {
  moduleLoader: loadCommonJsModule,
  providedExternals: {react: '16.7.0'}
});
```

When the `providedExternals` option is passed to the `createFeatureHub`
function, an `ExternalsValidator` is instantiated and passed to the
`FeatureAppManager` which uses it to validate the external dependencies of a
Feature App before creating it.

The same `ExternalsValidator` instance is also passed to the
`FeatureServiceRegistry` to validate the [external dependencies of Feature
Services][feature-service-dependencies] that are [provided by Feature
Apps][own-feature-service-definitions] which are loaded from a remote location,
instead of being provided by the integrator.

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
a remote location. It has two required props: `featureAppId` and `src`.

#### `featureAppId`

The Feature App ID is required to identify the Feature App instance. Multiple
Feature App Loaders with the same `featureAppId` will render the same Feature
app instance. The ID is also used as a consumer ID for dependent Feature
Services. To render multiple instances of the same kind of Feature App,
different IDs must be used:

```jsx
<section>
  <div>
    <FeatureAppLoader
      featureAppId="some-feature-app:main"
      src="https://example.com/some-feature-app.js"
    />
  </div>
  <aside>
    <FeatureAppLoader
      featureAppId="some-feature-app:aside"
      src="https://example.com/some-feature-app.js"
    />
  </aside>
</section>
```

#### `src`

A Feature App can be loaded and integrated by defining a `src` which is the URL
of its client module bundle:

```js
import {FeatureAppLoader} from '@feature-hub/react';
```

```jsx
<FeatureAppLoader
  featureAppId="some-feature-app"
  src="https://example.com/some-feature-app.js"
/>
```

> **Note:**  
>  If the integrator has configured the AMD module loader on the client, the Feature
> App to be loaded via `src` must be provided as an [AMD module][amd].

#### `serverSrc`

Additionally, when a Feature App needs to be rendered on the server, its
`serverSrc` must be specified, which is the URL of its server module bundle:

```jsx
<FeatureAppLoader
  featureAppId="some-feature-app"
  src="https://example.com/some-feature-app.js"
  serverSrc="https://example.com/some-feature-app-node.js"
/>
```

> **Notes:**
>
> - If the integrator has configured the CommonJS module loader on the server,
>   the Feature App to be loaded via `serverSrc` must be provided as a CommonJS
>   module.
> - If `baseUrl` is specified as well, it will be prepended if `serverSrc` is a
>   relative URL. In this case `baseUrl` must be an absolute URL.

#### `css`

You can also define a `css` prop to add stylesheets to the document:

```jsx
<FeatureAppLoader
  featureAppId="some-feature-app"
  src="https://example.com/some-feature-app.js"
  css={[
    {href: 'https://example.com/some-feature-app.css'},
    {href: 'https://example.com/some-feature-app-print.css', media: 'print'}
  ]}
/>
```

#### `baseUrl`

Optionally, a relative or absolute `baseUrl` can be specified for two purposes:

1. as a common base URL for relative [`src`](#src), [`serverSrc`](#serversrc),
   and [`css`](#css) hrefs
1. to provide the Feature App with a base URL with which it can refer to its own
   resources

```jsx
<FeatureAppLoader
  featureAppId="some-feature-app"
  baseUrl="https://example.com/some-feature-app"
  src="main.js"
  serverSrc="main-node.js"
  css={[{href: 'styles.css'}]}
/>
```

> **Note:**  
> Only relative URLs are prepended with the `baseUrl`. Absolute URLs are used
> unchanged.

#### `config`

With the `config` prop, a config object for a specific Feature App instance can
be provided:

```jsx
<FeatureAppLoader
  featureAppId="some-feature-app"
  src="https://example.com/some-feature-app.js"
  config={{someConfig: 'foo'}}
/>
```

For more details please refer to the the
["Feature App Configs" section](#feature-app-configs).

### React Feature App Container

The `FeatureAppContainer` component allows the integrator to bundle Feature Apps
instead of loading them from a remote location. It has two required props:
`featureAppId` and `featureAppDefinition`.

#### `featureAppDefinition`

A Feature App can be integrated by directly providing its
`featureAppDefinition`:

```js
import {FeatureAppContainer} from '@feature-hub/react';
import {someFeatureAppDefinition} from './some-feature-app';
```

```jsx
<FeatureAppContainer
  featureAppId="some-feature-app"
  featureAppDefinition={someFeatureAppDefinition}
/>
```

#### `featureAppId`

The Feature App ID is required to identify the Feature App instance. Multiple
Feature App Containers with the same `featureAppId` will render the same Feature
app instance. The ID is also used as a consumer ID for dependent Feature
Services. To render multiple instances of the same kind of Feature App,
different IDs must be used:

```jsx
<section>
  <div>
    <FeatureAppContainer
      featureAppId="some-feature-app:main"
      featureAppDefinition={someFeatureAppDefinition}
    />
  </div>
  <aside>
    <FeatureAppContainer
      featureAppId="some-feature-app:aside"
      featureAppDefinition={someFeatureAppDefinition}
    />
  </aside>
</section>
```

#### `baseUrl`

Optionally, a `baseUrl` can be specified to provide the Feature App with a base
URL that it can use to reference its own resources:

```jsx
<FeatureAppContainer
  featureAppId="some-feature-app"
  featureAppDefinition={someFeatureAppDefinition}
  baseUrl="https://example.com/some-feature-app"
/>
```

#### `config`

With the `config` prop, a config object for a specific Feature App instance can
be provided:

```jsx
<FeatureAppContainer
  featureAppId="some-feature-app"
  featureAppDefinition={someFeatureAppDefinition}
  config={{someConfig: 'foo'}}
/>
```

For more details please refer to the the
["Feature App Configs" section](#feature-app-configs).

### Error Handling

When a Feature App throws an error while rendering or, in the case of a
`ReactFeatureApp`, throws an error in a lifecycle method, the
`FeatureAppContainer` and `FeatureAppLoader` render `null`. On the server,
however, rendering errors are not caught and must therefore be handled by the
integrator.

## Placing Feature Apps on a Web Page Using Web Components

An integrator can use the `feature-app-loader` or the `feature-app-container`
custom elements (both from the [`@feature-hub/dom`][dom-api] package) to place
Feature Apps on a web page. Both of them need to be defined by the integrator to
make them available:

```js
import {
  defineFeatureAppContainer,
  defineFeatureAppLoader
} from '@feature-hub/dom';
```

```js
defineFeatureAppContainer(featureAppManager);
defineFeatureAppLoader(featureAppManager);
```

### `feature-app-loader`

The `feature-app-loader` custom element allows the integrator to load Feature
Apps from a remote location.

#### `featureAppId`

The Feature App ID is required to identify the Feature App instance. Multiple
`feature-app-loader` custom elements with the same `featureAppId` will render
the same Feature app instance. The ID is also used as a consumer ID for
dependent Feature Services. To render multiple instances of the same kind of
Feature App, different IDs must be used:

```html
<section>
  <div>
    <feature-app-loader
      featureAppId="some-feature-app:main"
      src="https://example.com/some-feature-app.js"
    ></feature-app-loader>
  </div>
  <aside>
    <feature-app-loader
      featureAppId="some-feature-app:aside"
      src="https://example.com/some-feature-app.js"
    ></feature-app-loader>
  </aside>
</section>
```

#### `src`

A Feature App can be loaded and integrated by defining a `src` attribute which
is the URL of its module bundle:

```html
<feature-app-loader
  featureAppId="some-feature-app"
  src="https://example.com/some-feature-app.js"
></feature-app-loader>
```

> **Note:**  
> If the integrator has configured the AMD module loader, the Feature App to be
> loaded via `src` must be provided as an [AMD module][amd].

#### `baseUrl`

Optionally, a `baseUrl` can be specified for two purposes:

1. as a common base URL for a relative [`src`](#src-1)
1. to provide the Feature App with a base URL with which it can refer to its own
   resources

```html
<feature-app-loader
  featureAppId="some-feature-app"
  baseUrl="https://example.com/some-feature-app"
  src="main.js"
></feature-app-loader>
```

#### `config`

With the `config` property, a config object for a specific Feature App instance
can be provided:

```js
const featureAppLoader = document.createElement('feature-app-loader');

featureAppLoader.setAttribute('featureAppId', 'some-feature-app');
featureAppLoader.setAttribute('src', 'https://example.com/some-feature-app.js');
featureAppLoader.config = {someConfig: 'foo'};

document.querySelector('#app').appendChild(featureAppLoader);
```

For more details please refer to the the
["Feature App Configs" section](#feature-app-configs).

#### `loading` Slot

The `feature-app-loader` custom element renders a slot named `loading` while the
Feature App module is loaded.

```html
<feature-app-loader
  featureAppId="some-feature-app"
  src="https://example.com/some-feature-app.js"
>
  <p slot="loading">Loading...</p>
</feature-app-loader>
```

#### `error` Slot

The `feature-app-loader` custom element renders a slot named `error` if the
Feature App module could not be loaded. It also passes the slot
[to the underlying `feature-app-container`](#error-slot-1).

```html
<feature-app-loader
  featureAppId="some-feature-app"
  src="https://example.com/some-feature-app.js"
>
  <p slot="error">Sorry, we messed up.</p>
</feature-app-loader>
```

### `feature-app-container`

The `feature-app-container` custom element allows the integrator to bundle
Feature Apps instead of loading them from a remote location.

#### `featureAppDefinition`

A Feature App can be integrated by directly providing its
`featureAppDefinition`:

```js
import {someFeatureAppDefinition} from './some-feature-app';
```

```js
const featureAppContainer = document.createElement('feature-app-container');

featureAppLoader.setAttribute('featureAppId', 'some-feature-app');
featureAppContainer.featureAppDefinition = someFeatureAppDefinition;

document.querySelector('#app').appendChild(featureAppContainer);
```

#### `featureAppId`

The Feature App ID is required to identify the Feature App instance. Multiple
`feature-app-loader` custom elements with the same `featureAppId` will render
the same Feature app instance. The ID is also used as a consumer ID for
dependent Feature Services. To render multiple instances of the same kind of
Feature App, different IDs must be used:

```js
const mainFeatureAppContainer = document.createElement('feature-app-container');

mainFeatureAppContainer.setAttribute('featureAppId', 'some-feature-app:main');
mainFeatureAppContainer.featureAppDefinition = someFeatureAppDefinition;

document.querySelector('main').appendChild(mainFeatureAppContainer);

const asideFeatureAppContainer = document.createElement(
  'feature-app-container'
);

asideFeatureAppContainer.setAttribute('featureAppId', 'some-feature-app:aside');
asideFeatureAppContainer.featureAppDefinition = someFeatureAppDefinition;

document.querySelector('aside').appendChild(asideFeatureAppContainer);
```

#### `baseUrl`

Optionally, a `baseUrl` can be specified to provide the Feature App with a base
URL that it can use to reference its own resources:

```js
const featureAppContainer = document.createElement('feature-app-container');

mainFeatureAppContainer.setAttribute('featureAppId', 'some-feature-app');
featureAppContainer.featureAppDefinition = someFeatureAppDefinition;

featureAppContainer.setAttribute(
  'baseUrl',
  'https://example.com/some-feature-app'
);

document.querySelector('#app').appendChild(featureAppContainer);
```

#### `config`

With the `config` property, a config object for a specific Feature App instance
can be provided:

```js
const featureAppContainer = document.createElement('feature-app-container');

mainFeatureAppContainer.setAttribute('featureAppId', 'some-feature-app');
featureAppContainer.featureAppDefinition = someFeatureAppDefinition;
featureAppLoader.config = {someConfig: 'foo'};

document.querySelector('#app').appendChild(featureAppContainer);
```

For more details please refer to the the
["Feature App Configs" section](#feature-app-configs).

#### `error` Slot

The `feature-app-container` custom element renders a slot named `error` if the
Feature App could not be created or if the Feature App throws in its `attachTo`
method.

```js
const featureAppContainer = document.createElement('feature-app-container');

mainFeatureAppContainer.setAttribute('featureAppId', 'some-feature-app');
featureAppContainer.featureAppDefinition = someFeatureAppDefinition;
featureAppContainer.innerHtml = '<p slot="error">Sorry, we messed up.</p>';

document.querySelector('#app').appendChild(featureAppContainer);
```

## Providing Configs

### Feature Service Configs

If a Feature Service must be configurable, it must export a factory function
that accepts some options and returns a Feature Service definition, e.g.:

```js
export function defineSomeFeatureService(options = {}) {
  return {
    id: 'acme:some-feature-service',

    create: () => {
      return {
        '1.0.0': () => ({
          featureService: {
            foo() {
              return 42 + options.someConfig;
            }
          }
        })
      };
    }
  };
}
```

The integrator can then pass the configuration to the Feature Service when
creating the Feature Service definiton for the `featureServiceDefinitions`
option of `createFeatureHub` (see above).

### Feature App Configs

When a Feature App needs a configuration, the `config` prop can be set on the
React `FeatureAppLoader`, `feature-app-loader` custom element, React
`FeatureAppContainer`, or the `feature-app-container` custom element for a given
Feature App instance, e.g.:

```jsx
<FeatureAppLoader
  featureAppId="some-feature-app"
  src="https://example.com/some-feature-app.js"
  config={{someConfig: 'foo'}}
/>
```

The `config` will be passed to the Feature App's `create` method via the `env`
argument:

```js
const someFeatureAppDefinition = {
  create(env) {
    const {someConfig} = env.config; // someConfig is 'foo'

    // ...
  }
};
```

> **Note:**  
> The `config` must be completely static, since it is only evaluated when a
> Feature App is mounted. Changing the `config` after a Feature App has been
> loaded, will have no effect! Therefore, it is not suitable to exchange dynamic
> state between a Feature App and its outer boundary. In this case a Feature
> Service should be used instead.

## Consuming Feature Services

Just like Feature Apps or Feature Services, the integrator itself can consume
its own registered Feature Services. To do this, the integrator needs to pass
the `featureServiceDependencies` option to the `createFeatureHub` function. This
will bind those Feature Services to the integrator and return them as
`featureServices` property of the `FeatureHub` object created:

```js
import {createFeatureHub} from '@feature-hub/core';
import {someFeatureServiceDefinition1} from './some-feature-service-1';
import {someFeatureServiceDefinition2} from './some-feature-service-2';
```

```js
const {featureServices} = createFeatureHub('acme:integrator', {
  featureServiceDefinitions: [
    someFeatureServiceDefinition1,
    someFeatureServiceDefinition2
  ],
  featureServiceDependencies: {
    [someFeatureServiceDefinition2.id]: '^1.0.0'
  }
});

const someFeatureService2 = featureServices[someFeatureServiceDefinition2.id];

someFeatureService2.foo(42);
```

[amd]: https://github.com/amdjs/amdjs-api/blob/master/AMD.md
[core-api]: /@feature-hub/modules/core.html
[dom-api]: /@feature-hub/modules/dom.html
[module-loader-amd-api]: /@feature-hub/modules/module_loader_amd.html
[module-loader-commonjs-api]: /@feature-hub/modules/module_loader_commonjs.html
[react-api]: /@feature-hub/modules/react.html
[feature-app-dependencies]: /docs/guides/writing-a-feature-app#dependencies
[feature-service-dependencies]:
  /docs/guides/writing-a-feature-service#dependencies
[implementing-a-feature-app-using-react]:
  /docs/guides/writing-a-feature-app#implementing-a-feature-app-using-react
[own-feature-service-definitions]:
  /docs/guides/writing-a-feature-app#ownfeatureservicedefinitions
[sharing-npm-dependencies]: /docs/guides/sharing-npm-dependencies
