# Feature Hub

An opinionated JavaScript library that implements the
[Micro Frontends](https://micro-frontends.org) approach for building modern web
apps with multiple teams using different technologies.

## Table of Contents

- [Feature Hub](#feature-hub)
  - [Table of Contents](#table-of-contents)
  - [Motivation](#motivation)
    - [Micro Frontends Instead of Monoliths](#micro-frontends-instead-of-monoliths)
    - [Requirements](#requirements)
  - [Feature Hub Architecture Components](#feature-hub-architecture-components)
  - [Usage Guides](#usage-guides)
    - [Integrating the Feature Hub](#integrating-the-feature-hub)
      - [React Feature App Loader](#react-feature-app-loader)
      - [React Feature App Container](#react-feature-app-container)
      - [Providing Externals](#providing-externals)
    - [Writing a Feature Service](#writing-a-feature-service)
      - [Feature Service Id & Dependencies](#feature-service-id--dependencies)
      - [Feature Service Instantiation & Programmatic Versioning](#feature-service-instantiation--programmatic-versioning)
      - [Putting It All Together](#putting-it-all-together)
      - [Feature Service Binding](#feature-service-binding)
    - [Writing a Feature App](#writing-a-feature-app)
      - [Feature App Id](#feature-app-id)
      - [Feature App Dependencies](#feature-app-dependencies)
      - [Feature App Instantiation](#feature-app-instantiation)
      - [Registering Feature Services](#registering-feature-services)
      - [Using Externals](#using-externals)

## Motivation

The Feature Hub has been created by [SinnerSchrader](https://sinnerschrader.com)
as part of a project for a client. To ease collaboration and reusability,
together with the client we decided to open-source the core engine of our Micro
Frontend solution with this library.

### Micro Frontends Instead of Monoliths

> The idea behind Micro Frontends is to think about a website or web app as a
> composition of features which are owned by independent teams. Each team has a
> distinct area of business or mission it cares about and specialises in. A team
> is cross functional and develops its features end-to-end, from database to
> user interface. — [micro-frontends.org](https://micro-frontends.org/)

### Requirements

The Feature Hub was designed with the following specific requirements in mind:

- Multiple teams with different technologies and knowledge should be able to
  own, develop, and deploy composable features independently.
- Multiple micro frontends need a way to safely interact with singleton browser
  resources like the URL/history or localStorage.
- Micro frontends must be able to share state to facilitate a consistent UX.
  - To enable efficient and timely UI updates, shared state must be accessible
    through reactive APIs.
  - Examples for features needing shared state are: a manager for ensuring only
    one modal is open at a time, or multiple micro frontends all displaying
    information about the same product selected in one of the micro frontends.
- For SEO purposes, and to operate existing fat client frontend apps which need
  to fetch loads of data on boot, server-side rendering must be supported.
  - Because of asynchronous data fetching and shared state changes, the server
    side rendering engine needs to be able to determine the point in time where
    it can send the finally rendered UI and its corresponding state to the
    client.
  - The server-side rendered UI and its corresponding state must be hydrated on
    the client without visual impact.
- Micro frontends that are incompatible with the integration environment should
  fail early, and not just when the user interacts with the specific
  incompatible feature.
- The composition environment for micro frontends should be flexible. Not only
  preprogrammed templates in a nodejs app, but also integrations from CMS
  environments where authors compose pages should be possible.

## Feature Hub Architecture Components

- **FeatureApp:** A feature app encapsulates a composable and reusable UI
  feature. It may have the need to share state with other feature apps.
- **FeatureService:** A feature service provides shared functionality and state
  to consumers on the feature hub. While simple code sharing could also be
  achieved by using libraries, there are features that can only, or easier, be
  achieved by using feature services:
  - Share state across consumers
  - Safe access to browser APIs and resources (e.g. URL)
  - Automatically scope API usage by consumer (e.g. logs)
  - Share configuration across consumers, but only maintain it once
- **FeatureServiceRegistry:** The feature service registry provides feature
  services to depending feature apps and/or other feature services.
- **FeatureAppManager:** The feature app manager loads feature apps and manages
  their lifecycle.
- **ReactFeatureAppLoader:** A feature app loader for a React environment. It
  uses the feature app manager to load and create a single feature app for a
  given JS url, and renders it into the DOM.
- **ReactFeatureAppContainer:** A feature app container for a React environment.
  It uses the feature app manager to create a single feature app for a given
  feature app definition, and renders it into the DOM.

## Usage Guides

There are three different roles in a feature hub environment:

1.  The **integrator** is the app that instantiates the feature hub components
    and provides the feature app compositions.
2.  A **provider** provides feature services to consumers through the feature
    service registry. Most providers are registered by the integrator but they
    can also be registered by feature apps.
3.  A **consumer** is everyone who consumes feature services. This can be a
    feature app, other feature services, or even the integrator.

### Integrating the Feature Hub

There are a few steps an integrator needs to follow to compose a web page of
multiple feature apps that share state through feature services:

1.  Gather consumer configs (for feature apps and feature services)
1.  Instantiate a `FeatureServiceRegistry` (with consumer configs)
1.  Register a set of feature services at the registry
1.  Create a `FeatureAppManager` singleton instance with the registry and a
    feature app module loader

A typical integrator bootstrap code would look like this:

```js
import {FeatureAppManager} from '@feature-hub/feature-app-manager';
import {FeatureServiceRegistry} from '@feature-hub/feature-service-registry';
import {loadFeatureAppModule} from '@feature-hub/node-feature-app-module-loader';

const configs = {}; // load configs from somewhere
const registry = new FeatureServiceRegistry(configs);

const featureServiceDefinitions = [
  sampleFeatureServiceDefinition1, // load definitions from somewhere
  sampleFeatureServiceDefinition2
];

registry.registerProviders(featureServiceDefinitions, 'integrator');

const manager = new FeatureAppManager(registry, loadFeatureAppModule);
```

A React integrator can then use the `ReactFeatureAppLoader` or the
`ReactFeatureAppContainer` to place feature apps onto the web page. Both need
the feature app manager singleton instance to create their feature app.

#### React Feature App Loader

With the `ReactFeatureAppLoader` a feature app can be loaded and rendered by
defining the URL to its JavaScript UMD bundle, e.g.:

```js
<ReactFeatureAppLoader
  manager={manager}
  src="https://example.com/my-feature-app.js"
/>
```

You can also define a `css` prop to add stylesheets to the document.

```js
<ReactFeatureAppLoader
  manager={manager}
  src="https://example.com/my-feature-app.js"
  css={[
    {href: 'https://example.com/my-feature-app.css'},
    {href: 'https://example.com/my-feature-app-print.css', media: 'print'}
  ]}
/>
```

If multiple instances of the same feature app must be placed onto a single page,
a `featureAppKey` that is unique for the feature app `id` must be defined by the
integrator, e.g.:

```js
<section>
  <div>
    <ReactFeatureAppLoader
      manager={manager}
      src="https://example.com/my-feature-app.js"
      featureAppKey="main"
    />
  </div>
  <aside>
    <ReactFeatureAppLoader
      manager={manager}
      src="https://example.com/my-feature-app.js"
      featureAppKey="aside"
    />
  </aside>
</section>
```

#### React Feature App Container

With the `ReactFeatureAppContainer` a feature app can be rendered by directly
providing its feature app definition:

```js
import {myFeatureAppDefinition} from './my-feature-app';
```

```js
<ReactFeatureAppContainer
  manager={manager}
  featureAppDefinition={myFeatureAppDefinition}
/>
```

This allows the integrator to bundle feature apps, instead of loading them from
a remote location.

If multiple instances of the same feature app must be placed onto a single page,
a `featureAppKey` that is unique for the feature app `id` must be defined by the
integrator, e.g.:

```js
<section>
  <div>
    <ReactFeatureAppContainer
      manager={manager}
      featureAppDefinition={myFeatureAppDefinition}
      featureAppKey="main"
    />
  </div>
  <aside>
    <ReactFeatureAppContainer
      manager={manager}
      featureAppDefinition={myFeatureAppDefinition}
      featureAppKey="aside"
    />
  </aside>
</section>
```

#### Providing Externals

When using the client-side feature app module loader, the integrator can provide
shared dependencies to feature apps using the `defineExternals` function:

```js
import {
  defineExternals,
  loadFeatureAppModule
} from '@feature-hub/browser-feature-app-module-loader';
```

```js
defineExternals({react: React, 'react-loadable': Loadable});

const manager = new FeatureAppManager(registry, loadFeatureAppModule);
```

### Writing a Feature Service

A feature service is defined by a feature service provider definition. It
consists of an `id`, a `dependencies` object, a `create` method.

#### Feature Service Id & Dependencies

A feature service provider must declare a unique consumer `id`. It is
recommended to use namespaces in the feature service id to avoid naming
conflicts, e.g.:

```js
const id = 'acme:my-feature-service';
```

The feature service id is referenced by other consumers in their `dependencies`
declaration along with a [semver](https://semver.org) version string, e.g.:

```js
const dependencies = {
  'acme:my-feature-service': '^2.0'
};
```

#### Feature Service Instantiation & Programmatic Versioning

The feature service provider definition's `create` method is called exactly once
by the feature service registry. It should store, and possibly initialize, any
shared state. The method takes the single argument `env`, which has the
following properties:

1.  `featureServices` — an object with feature services that are
    [semver-compatible](https://semver.org) with the declared dependencies
1.  `config` — a consumer config object that is provided by the integrator

A feature service provider can support multiple major versions at the same time.
The `create` method must return an object with a so-called feature service
binder for each supported major version. The feature service binder is a
function that is called for each consumer. It returns a feature service binding
with a consumer-bound `featureService` and an optional `unbind` method. The
feature service registry passes the bound feature service to the consumer's
`create` method.

With this in mind, a simple counter feature service could look like this:

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

Let's say after the first release of this feature service, the feature service
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

The version of a feature service needs to be incremented
[semver-compatible](https://semver.org) (without the need for a patch version).
In this case, a method is added, leading to a minor version bump.

In general, breaking changes should be avoided. If a feature service provider
still needs to make breaking changes, a new feature service implementation for
the next major version should be added. Old major versions should still be
supported.

Furthermore, it is possible to add deprecation warnings, and later remove
deprecated APIs.

In our example the feature service provider decides to rename the `plus`/`minus`
methods to `increment`/`decrement` and adds deprecation warnings (using a
fictive logger feature service that is declared as a dependency):

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

#### Putting It All Together

Finally, the `id`, the `dependencies` object, and the `create` method constitute
the feature service provider definition that needs to be exported:

```js
export const counterDefinition = {
  id: 'acme:counter',
  dependencies: {'acme:logger': '^1.0'},
  create
};
```

#### Feature Service Binding

Declaring a feature service binder (for each major version) allows feature
service providers to create and destroy consumer-specific state.

Let's assume our counter feature service, instead of handling a global count, is
supposed to handle consumer-specific counts, as well as expose a total of all
consumer-specific counts.

With our feature service binding creators, this could be implemented like this:

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

A feature app must be bundled as a [UMD](https://github.com/umdjs/umd) module.
This JavaScript bundle file must be deployed to a publicly available endpoint.
The integrator uses this URL to place the feature app onto a page using a
feature app loader, e.g. `ReactFeatureAppLoader`.

The default export of this module must be a `FeatureAppDefinition`. It consists
of an `id`, a `dependencies` object, and the method `create`.

#### Feature App Id

A feature app definition must declare a unique consumer `id`. It is recommended
to use namespaces for the feature app id to avoid naming conflicts, e.g.:

```js
const id = 'acme:my-feature-app';
```

This id is used to look up the config for a feature app. Furthermore, it is used
as a consumer id for feature services. If there is more than one instance of a
feature app on a single page, the integrator must set a unique `featureAppKey`
for each feature app with the same id. The `FeatureServiceRegistry` then uses
the id together with the key to create a unique consumer id.

#### Feature App Dependencies

In `dependencies`, required feature services are declared with their service id
and a [semver](https://semver.org) version string:

```js
const dependencies = {
  'acme:counter': '^2.0'
};
```

#### Feature App Instantiation

The method `create` takes the single argument `env`, which has the following
properties:

1.  `featureServices` — an object of feature services that are
    [semver-compatible](https://semver.org) with the declared dependencies
1.  `config` — a consumer config object that is provided by the integrator

A feature app can either be a "React feature app" or a "DOM feature app".

1.  A React feature app definition's `create` method returns a feature app
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

1.  A DOM feature app definition's `create` method returns a feature app object
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

A feature app can also register its own feature service providers by declaring
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

This allows teams to quickly get feature apps off the ground, without being
dependent on the integrator. However, as soon as other teams need to use this
feature service, it should be published and included in the global set of
feature services by the integrator.

#### Using Externals

If the integrator has provided externals (see above) to feature apps, they
should define these externals in their build config. For example, defining
`react` as external in a webpack config would look like this:

```json
{
  "externals": {
    "react": "react"
  }
}
```
