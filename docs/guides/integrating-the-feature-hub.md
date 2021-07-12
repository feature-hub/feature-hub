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
      someFeatureServiceDefinition2,
    ],
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
the [`@feature-hub/module-loader-amd`][module-loader-amd-api] package, the
[`@feature-hub/module-loader-federation`][module-loader-federation-api], the
[`@feature-hub/module-loader-commonjs`][module-loader-commonjs-api] package, or
a custom loader).

The module loader can be provided with the `moduleLoader` option of the
`createFeatureHub` function.

### Client

#### AMD Module Loader

```js
import {loadAmdModule} from '@feature-hub/module-loader-amd';
```

```js
const {featureAppManager} = createFeatureHub('acme:integrator', {
  moduleLoader: loadAmdModule,
});
```

#### Webpack Module Federation Loader

```js
import {loadFederatedModule} from '@feature-hub/module-loader-federation';
```

```js
const {featureAppManager} = createFeatureHub('acme:integrator', {
  moduleLoader: loadFederatedModule,
});
```

### Server

```js
import {loadCommonJsModule} from '@feature-hub/module-loader-commonjs';
```

```js
const {featureAppManager} = createFeatureHub('acme:integrator', {
  moduleLoader: loadCommonJsModule,
});
```

### Custom Module Loader

The integrator can also provide a custom module loader that can handle multiple
module types:

```js
import {loadAmdModule} from '@feature-hub/module-loader-amd';
import {loadFederatedModule} from '@feature-hub/module-loader-federation';
```

```js
const {featureAppManager} = createFeatureHub('acme:integrator', {
  moduleLoader: (url, moduleType) =>
    moduleType === 'federated' ? loadFederatedModule(url) : loadAmdModule(url),
});
```

In this example AMD is regarded as the default module type. If a Feature App
uses a different module type than the default, it must be specified as the
[`moduleType`](#moduletype) prop of the `FeatureAppLoader`, matching the usage
in the custom module loader.

> **Note:**  
> Specifying the module type of a Feature App module is currently only supported
> by the [React Feature App Loader](#react-feature-app-loader).

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
  providedExternals: {react: '16.7.0'},
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
  providedExternals: {react: '16.7.0'},
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

#### `moduleType`

The module type of the Feature App's client module bundle. It is passed to the
module loader that was provided by the integrator. It can be omited if the
provided module loader can only handle a single module type, or if it handles a
default module type (see [Custom Module Loader](#custom-module-loader)).

```jsx
<FeatureAppLoader
  featureAppId="some-feature-app"
  src="https://example.com/some-federated-feature-app.js"
  moduleType="federated"
/>
```

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

#### `serverModuleType`

The module type of the Feature App's server module. It is passed to the module
loader that was provided by the integrator. It can be omited if the provided
module loader can only handle a single module type, or if it handles a default
module type (see [Custom Module Loader](#custom-module-loader)).

```jsx
<FeatureAppLoader
  featureAppId="some-feature-app"
  src="https://example.com/some-feature-app.js"
  serverSrc="https://example.com/some-feature-app-node.mjs"
  serverModuleType="esm"
/>
```

#### `css`

You can also define a `css` prop to add stylesheets to the document:

```jsx
<FeatureAppLoader
  featureAppId="some-feature-app"
  src="https://example.com/some-feature-app.js"
  css={[
    {href: 'https://example.com/some-feature-app.css'},
    {href: 'https://example.com/some-feature-app-print.css', media: 'print'},
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

#### `featureAppName`

The `featureAppName` is used as a consumer name for dependent Feature Services
that can use it for display purposes, logging, looking up Feature App
configuration meta data, etc. In contrast to the `featureAppId`, the
`featureAppName` must not be unique, e.g.:

```jsx
<section>
  <div>
    <FeatureAppLoader
      featureAppId="some-feature-app:main"
      featureAppName="some-feature-app"
      src="https://example.com/some-feature-app.js"
    />
  </div>
  <aside>
    <FeatureAppLoader
      featureAppId="some-feature-app:aside"
      featureAppName="some-feature-app"
      src="https://example.com/some-feature-app.js"
    />
  </aside>
</section>
```

#### `done`

For a short-lived Feature App a `done` callback can be defined, which the
Feature App can call when it has completed its task. For example, if the Feature
App was opened in a layer, the layer could be closed when `done()` is called.

```jsx
function FeatureAppInALayerExample() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      {isOpen && (
        <Layer>
          <FeatureAppLoader
            featureAppId="some-feature-app"
            src="https://example.com/some-feature-app.js"
            done={() => setIsOpen(false)}
          />
        </Layer>
      )}
      <button onClick={() => setIsOpen(true)}>Open</button>
    </div>
  );
}
```

#### `children`

One can pass a rendering function as the React Children (i.e. the `children`
prop) that allows custom rendering of the Feature App during loading and error
states.

For more details please refer to the the
["Custom Loading and Error UI" section](#custom-loading-and-error-ui).

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

#### `featureAppName`

The `featureAppName` is used as a consumer name for dependent Feature Services
that can use it for display purposes, logging, looking up Feature App
configuration meta data, etc. In contrast to the `featureAppId`, the
`featureAppName` must not be unique, e.g.:

```jsx
<section>
  <div>
    <FeatureAppContainer
      featureAppId="some-feature-app:main"
      featureAppName="some-feature-app"
      featureAppDefinition={someFeatureAppDefinition}
    />
  </div>
  <aside>
    <FeatureAppContainer
      featureAppId="some-feature-app:aside"
      featureAppName="some-feature-app"
      featureAppDefinition={someFeatureAppDefinition}
    />
  </aside>
</section>
```

#### `done`

For a short-lived Feature App a `done` callback can be defined, which the
Feature App can call when it has completed its task. For example, if the Feature
App was opened in a layer, the layer could be closed when `done()` is called.

```jsx
function FeatureAppInALayerExample() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      {isOpen && (
        <Layer>
          <FeatureAppContainer
            featureAppId="some-feature-app"
            featureAppDefinition={someFeatureAppDefinition}
            done={() => setIsOpen(false)}
          />
        </Layer>
      )}
      <button onClick={() => setIsOpen(true)}>Open</button>
    </div>
  );
}
```

#### `children`

One can pass a rendering function as the React Children (i.e. the `children`
prop) that allows custom rendering of the Feature App during loading and error
states.

For more details please refer to the the
["Custom Loading and Error UI" section](#custom-loading-and-error-ui).

### Error Handling

When a Feature App throws an error while rendering or, in the case of a
`ReactFeatureApp`, throws an error in a lifecycle method, the
`FeatureAppContainer` and `FeatureAppLoader` render `null`. On the server,
however, rendering errors are not caught and must therefore be handled by the
integrator.

### Custom Loading and Error UI

An integrator can customize the rendering of Loading states and Errors, using
the `children` "render prop" in `FeatureAppContainer` or `FeatureAppLoader`.

The `children` prop is a function that receives parameters in form of an object
and returns rendered React children (a React Node).

Please [look at the API reference][custom-rendering-param-api], to learn more
about the passed params:

- [`error`][custom-rendering-param-error-api]
- [`loading`][custom-rendering-param-loading-api]
- [`featureAppNode`][custom-rendering-param-featureappnode-api]

> This API allows full control over the rendering output, and must therefore
> abide a set of rules that need to be followed carefully:
>
> - **The `featureAppNode` might be passed and has to be rendered, even when
>   `loading=true`.**  
>   A Feature App might depend on being rendered, before resolving its loading
>   promise. To not show the Feature App in favour of a loading UI, it must be
>   **hidden visually** (e.g. via `display: none;`).
> - **The `featureAppNode` should always be rendered into the same position of
>   the returned tree.**  
>   Otherwise it could occur, that React re-mounts the Feature App, which is
>   resource-expensive and can break DOM Feature Apps.

#### Custom UI Example

> The following example can also be seen with more context in the ["React
> Loading And Error UI" demo][react-loading-and-error-ui-demo].

```jsx
<FeatureAppContainer
  featureAppId="some-feature-app"
  featureAppDefinition={someFeatureAppDefinition}
>
  {({ error, loading, featureAppNode }) => {
    if (error) {
      return <ErrorUi error={error}>
    }

    return (
      <div>
        <div style={{display: loading ? 'none' : 'initial'}}>
          {featureAppNode}
        </div>
        {loading && <Spinner />}
      </div>
    );
  }}
</FeatureAppContainer>
```

## Placing Feature Apps on a Web Page Using Web Components

An integrator can use the `feature-app-loader` or the `feature-app-container`
custom elements (both from the [`@feature-hub/dom`][dom-api] package) to place
Feature Apps on a web page. Both of them need to be defined by the integrator to
make them available:

```js
import {
  defineFeatureAppContainer,
  defineFeatureAppLoader,
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

#### `featureAppName`

The `featureAppName` is used as a consumer name for dependent Feature Services
that can use it for display purposes, logging, looking up Feature App
configuration meta data, etc. In contrast to the `featureAppId`, the
`featureAppName` must not be unique, e.g.:

```html
<section>
  <div>
    <feature-app-loader
      featureAppId="some-feature-app:main"
      featureAppName="some-feature-app"
      src="https://example.com/some-feature-app.js"
    ></feature-app-loader>
  </div>
  <aside>
    <feature-app-loader
      featureAppId="some-feature-app:aside"
      featureAppName="some-feature-app"
      src="https://example.com/some-feature-app.js"
    ></feature-app-loader>
  </aside>
</section>
```

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

#### `featureAppName`

The `featureAppName` is used as a consumer name for dependent Feature Services
that can use it for display purposes, logging, looking up Feature App
configuration meta data, etc. In contrast to the `featureAppId`, the
`featureAppName` must not be unique, e.g.:

```js
const mainFeatureAppContainer = document.createElement('feature-app-container');

mainFeatureAppContainer.setAttribute('featureAppId', 'some-feature-app:main');
mainFeatureAppContainer.setAttribute('featureAppName', 'some-feature-app');
mainFeatureAppContainer.featureAppDefinition = someFeatureAppDefinition;

document.querySelector('main').appendChild(mainFeatureAppContainer);

const asideFeatureAppContainer = document.createElement(
  'feature-app-container'
);

asideFeatureAppContainer.setAttribute('featureAppId', 'some-feature-app:aside');
asideFeatureAppContainer.setAttribute('featureAppName', 'some-feature-app');
asideFeatureAppContainer.featureAppDefinition = someFeatureAppDefinition;

document.querySelector('aside').appendChild(asideFeatureAppContainer);
```

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
            },
          },
        }),
      };
    },
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
  },
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
    someFeatureServiceDefinition2,
  ],
  featureServiceDependencies: {
    [someFeatureServiceDefinition2.id]: '^1.0.0',
  },
});

const someFeatureService2 = featureServices[someFeatureServiceDefinition2.id];

someFeatureService2.foo(42);
```

[amd]: https://github.com/amdjs/amdjs-api/blob/master/AMD.md
[core-api]: /api/modules/core.html
[dom-api]: /api/modules/dom.html
[module-loader-amd-api]: /api/modules/module_loader_amd.html
[module-loader-federation-api]: /api/modules/module_loader_federation.html
[module-loader-commonjs-api]: /api/modules/module_loader_commonjs.html
[react-api]: /api/modules/react.html
[feature-app-dependencies]: /docs/guides/writing-a-feature-app#dependencies
[feature-service-dependencies]:
  /docs/guides/writing-a-feature-service#dependencies
[implementing-a-feature-app-using-react]:
  /docs/guides/writing-a-feature-app#implementing-a-feature-app-using-react
[own-feature-service-definitions]:
  /docs/guides/writing-a-feature-app#ownfeatureservicedefinitions
[sharing-npm-dependencies]: /docs/guides/sharing-npm-dependencies
[custom-rendering-param-api]:
  /api/interfaces/react.customfeatureapprenderingparams.html
[custom-rendering-param-error-api]:
  /api/interfaces/react.customfeatureapprenderingparams.html#error
[custom-rendering-param-loading-api]:
  /api/interfaces/react.customfeatureapprenderingparams.html#loading
[custom-rendering-param-featureappnode-api]:
  /api/interfaces/react.customfeatureapprenderingparams.html#featureappnode
[react-loading-and-error-ui-demo]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/react-loading-and-error-ui
