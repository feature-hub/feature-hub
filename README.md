# Feature Hub

The Feature Hub is an opinionated JavaScript library that implements the
[Micro Frontends](https://micro-frontends.org) approach for building modern web
apps with multiple teams using different technologies.

This monorepo contains a [collection of packages](#monorepo-packages) that can
be used together as a full-fledged solution for composing Micro Frontends. It
supports React Micro Frontends as first-class citizens, but also allows the
integration of Micro Frontends that are built with any other frontend technology
(e.g. Vue.js, Angular, Web Components).

In contrast, the Feature Hub core package is totally independent of React. It
could be used to build an end-to-end solution with any other frontend
technology.

**This software is in active development and is subject to potentially breaking
changes. We are not yet using this software in production. Our currently planned
milestones can be viewed
[here](https://github.com/sinnerschrader/feature-hub/milestones).**

## Table of Contents

- [Feature Hub](#feature-hub)
  - [Table of Contents](#table-of-contents)
  - [Motivation](#motivation)
    - [Micro Frontends Instead of Monoliths](#micro-frontends-instead-of-monoliths)
    - [Feature Apps & Feature Services](#feature-apps--feature-services)
    - [Requirements](#requirements)
  - [Monorepo Packages](#monorepo-packages)
  - [Usage Guides](#usage-guides)
    - [Integrating the Feature Hub](#integrating-the-feature-hub)
      - [The React Feature App Loader](#the-react-feature-app-loader)
      - [The React Feature App Container](#the-react-feature-app-container)
      - [Providing Externals](#providing-externals)
    - [Writing a Feature Service](#writing-a-feature-service)
      - [Feature Service ID & Dependencies](#feature-service-id--dependencies)
      - [Feature Service Instantiation & Programmatic Versioning](#feature-service-instantiation--programmatic-versioning)
      - [Feature Service Provider Definition](#feature-service-provider-definition)
      - [Feature Service Binding](#feature-service-binding)
    - [Writing a Feature App](#writing-a-feature-app)
      - [Feature App ID](#feature-app-id)
      - [Feature App Dependencies](#feature-app-dependencies)
      - [Feature App Instantiation](#feature-app-instantiation)
      - [Registering Feature Services](#registering-feature-services)
      - [Using Externals](#using-externals)

## Motivation

The Feature Hub has been created by [SinnerSchrader](https://sinnerschrader.com)
as part of a project for a client. In order to facilitate collaboration and
reusability, we decided together with the client to publish the core
functionality of our Micro Frontend solution as open source.

### Micro Frontends Instead of Monoliths

> The idea behind Micro Frontends is to think about a website or web app as a
> composition of features which are owned by independent teams. Each team has a
> distinct area of business or mission it cares about and specialises in. A team
> is cross functional and develops its features end-to-end, from database to
> user interface. — [micro-frontends.org](https://micro-frontends.org/)

In this software, a Micro Frontend is referred to as a **Feature App**.

### Feature Apps & Feature Services

A Feature App encapsulates a composable and reusable UI feature. It may have the
need to share state with other Feature Apps.

A Feature Service provides shared state and functionality to consumers, e.g.
Feature Apps, on the Feature Hub. While simple code sharing could also be
achieved by using libraries, there are features that can only, or easier, be
achieved by using Feature Services:

- Share state across consumers.
- Safe access to browser APIs and resources (e.g. URL).
- Automatically scope API usage by consumer (e.g. logging).
- Share configuration across consumers, but only maintain it once.

### Requirements

The Feature Hub was designed with the following specific requirements in mind:

- Multiple teams with different technologies and knowledge should be able to
  own, develop, and deploy composable features independently.
- Multiple Feature Apps need a way to safely interact with singleton browser
  APIs like the URL/history or localStorage.
- Feature Apps must be able to share state to facilitate a consistent UX.
  - Examples for features needing shared state are: a manager for ensuring only
    one modal is open at a time, or multiple Feature Apps display information
    about the same product selected in one of the Feature Apps.
- For SEO purposes, and to operate existing fat client frontend apps which need
  to fetch loads of data on boot, server-side rendering must be supported.
  - Because of asynchronous data fetching and shared state changes, the server
    side rendering engine needs to be able to determine the point in time where
    it can send the finally rendered UI and its corresponding state to the
    client.
  - The server-side rendered UI and its corresponding state must be hydrated on
    the client without visual impact.
- Feature Apps that are incompatible with the integration environment should
  fail early, and not just when the user interacts with the specific
  incompatible feature.
- The composition environment for Feature Apps should be flexible. Not only
  preprogrammed templates in a Node.js app, but also integrations from CMS
  environments where authors compose pages should be possible.

## Monorepo Packages

| Package                                                                                 | Description                                             | API                                         |
| --------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------- |
| [@feature-hub/core][core-pkg]                                                           | The core functionality of the Feature Hub.              | [📖][core-api]                              |
| [@feature-hub/browser-feature-app-module-loader][browser-feature-app-module-loader-pkg] | A Feature App module loader for browsers.               | [📖][browser-feature-app-module-loader-api] |
| [@feature-hub/node-feature-app-module-loader][node-feature-app-module-loader-pkg]       | A Feature App module loader for Node.js.                | [📖][node-feature-app-module-loader-api]    |
| [@feature-hub/react-feature-app-loader][react-feature-app-loader-pkg]                   | A React component for integrating remote Feature Apps.  | [📖][react-feature-app-loader-api]          |
| [@feature-hub/react-feature-app-container][react-feature-app-container-pkg]             | A React component for integrating bundled Feature Apps. | [📖][react-feature-app-container-api]       |

## Usage Guides

There are three different roles in a Feature Hub environment:

1.  The **integrator** is the app that instantiates the Feature Hub components
    and provides the Feature App compositions.
2.  A **provider** provides Feature Services to consumers through the feature
    service registry. Most providers are registered by the integrator but they
    can also be registered by Feature Apps.
3.  A **consumer** is everyone who consumes Feature Services. This can be a
    Feature App, other Feature Services, or even the integrator.

### Integrating the Feature Hub

The core package of the Feature Hub provides the following two major building
blocks:

- The `FeatureServiceRegistry`: A class for providing Feature Services to
  dependent consumers.
- The `FeatureAppManager`: A class for managing the lifecycle of Feature Apps.

There are a few steps an integrator needs to follow to compose a web page of
multiple Feature Apps that share state through Feature Services:

1.  Gather consumer configs (for Feature Apps and Feature Services).
1.  Instantiate a `FeatureServiceRegistry` (with consumer configs).
1.  Register a set of Feature Services at the registry.
1.  Create a `FeatureAppManager` singleton instance with the registry and a
    Feature App module loader.

A typical integrator bootstrap code would look like this:

```js
import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {loadFeatureAppModule} from '@feature-hub/node-feature-app-module-loader';

const configs = {}; // import configs from somewhere
const registry = new FeatureServiceRegistry(configs);

const featureServiceDefinitions = [
  sampleFeatureServiceDefinition1, // import definitions from somewhere
  sampleFeatureServiceDefinition2
];

registry.registerProviders(featureServiceDefinitions, 'integrator');

const manager = new FeatureAppManager(registry, loadFeatureAppModule);
```

A React integrator can then use the `FeatureAppLoader` (from
`@feature-hub/react-feature-app-loader`) or the `FeatureAppContainer` (from
`@feature-hub/react-feature-app-container`) to place Feature Apps onto the web
page. Both need the `FeatureAppManager` singleton instance to create their
Feature App.

#### The React Feature App Loader

With the React `FeatureAppLoader` a Feature App can be loaded and rendered by
defining the URL to its JavaScript UMD bundle, e.g.:

```jsx
<FeatureAppLoader
  manager={manager}
  src="https://example.com/my-feature-app.js"
/>
```

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
a `featureAppKey` that is unique for the Feature App `id` must be defined by the
integrator, e.g.:

```jsx
<section>
  <div>
    <FeatureAppLoader
      manager={manager}
      src="https://example.com/my-feature-app.js"
      featureAppKey="main"
    />
  </div>
  <aside>
    <FeatureAppLoader
      manager={manager}
      src="https://example.com/my-feature-app.js"
      featureAppKey="aside"
    />
  </aside>
</section>
```

#### The React Feature App Container

With the React `FeatureAppContainer` a Feature App can be rendered by directly
providing its Feature App definition:

```js
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
a `featureAppKey` that is unique for the Feature App `id` must be defined by the
integrator, e.g.:

```jsx
<section>
  <div>
    <FeatureAppContainer
      manager={manager}
      featureAppDefinition={myFeatureAppDefinition}
      featureAppKey="main"
    />
  </div>
  <aside>
    <FeatureAppContainer
      manager={manager}
      featureAppDefinition={myFeatureAppDefinition}
      featureAppKey="aside"
    />
  </aside>
</section>
```

#### Providing Externals

When using the browser Feature App module loader, the integrator can provide
shared npm dependencies to Feature Apps using the `defineExternals` function:

```js
import {
  defineExternals,
  loadFeatureAppModule
} from '@feature-hub/browser-feature-app-module-loader';
import * as React from 'react';
import Loadable from 'react-loadable';
```

```js
defineExternals({react: React, 'react-loadable': Loadable});

const manager = new FeatureAppManager(registry, loadFeatureAppModule);
```

### Writing a Feature Service

A Feature Service is defined by a Feature Service provider definition. It
consists of an `id`, a `dependencies` object, a `create` method.

#### Feature Service ID & Dependencies

A Feature Service provider must declare a unique consumer `id`. It is
recommended to use namespaces in the Feature Service ID to avoid naming
conflicts, e.g.:

```js
const id = 'acme:my-feature-service';
```

The Feature Service ID is referenced by other consumers in their `dependencies`
declaration along with a [semver](https://semver.org) version string, e.g.:

```js
const dependencies = {
  'acme:my-feature-service': '^2.0'
};
```

#### Feature Service Instantiation & Programmatic Versioning

The Feature Service provider definition's `create` method is called exactly once
by the Feature Service registry. It should store, and possibly initialize, any
shared state. The method takes the single argument `env`, which has the
following properties:

1.  `featureServices` — an object with Feature Services that are
    [semver-compatible](https://semver.org) with the declared dependencies.
1.  `config` — a consumer config object that is provided by the integrator.

A Feature Service provider can support multiple major versions at the same time.
The `create` method must return an object with a so-called Feature Service
binder for each supported major version. The Feature Service binder is a
function that is called for each consumer. It returns a Feature Service binding
with a consumer-bound `featureService` and an optional `unbind` method. The
Feature Service registry passes the bound Feature Service to the consumer's
`create` method.

With this in mind, a simple counter Feature Service could look like this:

```js
function create(env) {
  let count = env.config.initialCount || 0;

  const v1 = uniqueConsumerId => ({
    featureService: {
      plus() {
        count += 1;
      },

      minus() {
        count -= 1;
      }
    }
  });

  return {'1.0': v1};
}
```

Let's say after the first release of this Feature Service, the Feature Service
provider noticed that there is no way to retrieve the current count. Therefore,
they introduce the method `getCount` in version `1.1`:

```js
function create(env) {
  let count = env.config.initialCount || 0;

  const v1 = uniqueConsumerId => ({
    featureService: {
      plus() {
        count += 1;
      },

      minus() {
        count -= 1;
      },

      getCount() {
        return count;
      }
    }
  });

  return {'1.1': v1};
}
```

The version of a Feature Service needs to be incremented
[semver-compatible](https://semver.org) (without the need for a patch version).
In this case, a method is added, leading to a minor version bump.

In general, breaking changes should be avoided. If a Feature Service provider
still needs to make breaking changes, a new Feature Service implementation for
the next major version should be added. Old major versions should still be
supported.

Furthermore, it is possible to add deprecation warnings, and later remove
deprecated APIs.

In our example the Feature Service provider decides to rename the `plus`/`minus`
methods to `increment`/`decrement` and adds deprecation warnings (using a
fictive logger Feature Service that is declared as a dependency):

```js
function create(env) {
  let count = env.config.initialCount || 0;

  const getCount = () => count;
  const decrement = () => void --count;
  const increment = () => void ++count;

  const logger = env.featureServices['acme:logger'];

  const v1 = uniqueConsumerId => ({
    featureService: {
      getCount,

      plus() {
        logger.warn('Deprecation warning: use increment instead of plus.');
        increment();
      },

      minus() {
        logger.warn('Deprecation warning: use decrement instead of minus.');
        decrement();
      }
    }
  });

  const v2 = uniqueConsumerId => ({
    featureService: {getCount, increment, decrement}
  });

  return {'1.1': v1, '2.0': v2};
}
```

#### Feature Service Provider Definition

Finally, the `id`, the `dependencies` object, and the `create` method constitute
the Feature Service provider definition that needs to be exported:

```js
export const counterDefinition = {
  id: 'acme:counter',
  dependencies: {'acme:logger': '^1.0'},
  create
};
```

#### Feature Service Binding

Declaring a Feature Service binder (for each major version) allows Feature
Service providers to create and destroy consumer-specific state.

Let's assume our counter Feature Service, instead of handling a global count, is
supposed to handle consumer-specific counts, as well as expose a total of all
consumer-specific counts.

With our Feature Service binders, this could be implemented like this:

```js
function create(env) {
  // Shared state lives here.
  let consumerCounts = {};

  return {
    '1.0': uniqueConsumerId => {
      // Consumer state lives here.
      consumerCounts[uniqueConsumerId] = 0;

      const unbind = () => {
        delete consumerCounts[uniqueConsumerId];
      };

      const featureService = {
        increment() {
          consumerCounts[uniqueConsumerId] += 1;
        },

        decrement() {
          consumerCounts[uniqueConsumerId] -= 1;
        },

        get count() {
          return consumerCounts[uniqueConsumerId];
        },

        get totalCount() {
          return Object.values(consumerCounts).reduce(
            (totalCount, consumerCount) => totalCount + consumerCount,
            0
          );
        }
      };

      return {featureService, unbind};
    }
  };
}
```

### Writing a Feature App

A Feature App must be bundled as a [UMD](https://github.com/umdjs/umd) module.
This JavaScript bundle file must be deployed to a publicly available endpoint.
The integrator uses this URL to place the Feature App onto a page using a
Feature App loader, e.g. `FeatureAppLoader`.

The default export of this module must be a `FeatureAppDefinition`. It consists
of an `id`, a `dependencies` object, and the method `create`.

#### Feature App ID

A Feature App definition must declare a unique consumer `id`. It is recommended
to use namespaces for the Feature App ID to avoid naming conflicts, e.g.:

```js
const id = 'acme:my-feature-app';
```

This ID is used to look up the config for a Feature App. Furthermore, it is used
as a consumer ID for Feature Services. If there is more than one instance of a
Feature App on a single page, the integrator must set a unique `featureAppKey`
for each Feature App with the same ID. The `FeatureServiceRegistry` then uses
the ID together with the key to create a unique consumer ID.

#### Feature App Dependencies

In `dependencies`, required Feature Services are declared with their service ID
and a [semver](https://semver.org) version string:

```js
const dependencies = {
  'acme:counter': '^2.0'
};
```

#### Feature App Instantiation

The method `create` takes the single argument `env`, which has the following
properties:

1.  `featureServices` — an object of Feature Services that are
    [semver-compatible](https://semver.org) with the declared dependencies.
1.  `config` — a consumer config object that is provided by the integrator.

A Feature App can either be a "React Feature App" or a "DOM Feature App".

1.  A React Feature App definition's `create` method returns a Feature App
    object with a `render` method that itself returns a `ReactNode`.

    ```js
    export default {
      id,
      dependencies,

      create(env) {
        return {
          render: () => <div>Foo</div>
        };
      }
    };
    ```

    **Note:** Since this element is directly rendered by React, the standard
    React lifecyle methods can be used (if `render` returns an instance of a
    React component class).

1.  A DOM Feature App definition's `create` method returns a Feature App object
    with an `attachTo` method that accepts a DOM container element.

    ```js
    export default {
      id,
      dependencies,

      create(env) {
        return {
          attachTo(container) {
            container.innerText = 'Foo';
          }
        };
      }
    };
    ```

#### Registering Feature Services

A Feature App can also register its own Feature Service providers by declaring
`ownFeatureServiceProviderDefinitions`, e.g.:

```js
import {myService} from './my-service';

export default {
  id: 'acme:my-feature-app',

  dependencies: {
    'acme:my-service': '^1.0'
  },

  ownFeatureServiceProviderDefinitions: [myService],

  create(env) {
    const myService = env.featureService['acme:my-service'];

    myService.init(42);

    return {
      render: () => <div>{myService.getSomeSharedState()}</div>
    };
  }
};
```

This allows teams to quickly get Feature Apps off the ground, without being
dependent on the integrator. However, as soon as other teams need to use this
Feature Service, it should be published and included in the global set of
Feature Services by the integrator.

#### Using Externals

If the integrator has provided externals (see above) to Feature Apps, they
should define these externals in their build config. For example, defining
`react` as external in a webpack config would look like this:

```json
{
  "externals": {
    "react": "react"
  }
}
```

[core-api]: https://sinnerschrader.github.io/feature-hub/api/@feature-hub/core/
[core-pkg]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/core
[browser-feature-app-module-loader-api]:
  https://sinnerschrader.github.io/feature-hub/api/@feature-hub/browser-feature-app-module-loader/
[browser-feature-app-module-loader-pkg]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/browser-feature-app-module-loader
[node-feature-app-module-loader-api]:
  https://sinnerschrader.github.io/feature-hub/api/@feature-hub/node-feature-app-module-loader/
[node-feature-app-module-loader-pkg]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/node-feature-app-module-loader
[react-feature-app-loader-api]:
  https://sinnerschrader.github.io/feature-hub/api/@feature-hub/react-feature-app-loader/
[react-feature-app-loader-pkg]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/react-feature-app-loader
[react-feature-app-container-api]:
  https://sinnerschrader.github.io/feature-hub/api/@feature-hub/react-feature-app-container/
[react-feature-app-container-pkg]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/react-feature-app-container
