---
id: writing-a-feature-service
title: Writing a Feature Service
sidebar_label: Writing a Feature Service
---

A Feature Service is described by a provider definition object. It consists of
an `id`, `dependencies` and/or `optionalDependencies` objects, and a `create`
method:

```js
const myFeatureServiceDefinition = {
  id: 'acme:my-feature-service',

  dependencies: {
    featureServices: {
      'acme:other-feature-service': '^2.0.0',
    },
    externals: {
      rxjs: '^6.4.0',
    },
  },

  optionalDependencies: {
    featureServices: {
      'acme:optional-feature-service': '^1.3.0',
    },
  },

  create(env) {
    // ...
  },
};
```

## `id`

It is recommended to use namespaces for the Feature Service ID to avoid naming
conflicts, e.g. `'acme:my-feature-service'`. This ID is used as a consumer ID
for [binding the required Feature Services][feature-service-binder] to the
dependent Feature Service.

## `dependencies`

The `dependencies` map can contain two types of required dependencies:

1. With `dependencies.featureServices` all required Feature Services are
   declared. If one of those dependencies can't be fulfilled, Feature Service
   registration will fail. This means the Feature Service can be sure that those
   dependencies are always present when it is created.

   Feature Service dependencies are declared with their ID as key, and a [semver
   version range][semver] as value, e.g.
   `{'acme:other-feature-service': '^2.0.0'}`. Since
   [Feature Services only provide the latest minor version for each major version](#providing-a-versioned-api),
   a [caret range][semver-caret-range] should be used here. If instead an exact
   version or a [tilde range][semver-tilde-range] is used, this will be coerced
   to a caret range by the `Feature ServiceRegistry`.

1. With `dependencies.externals` all required external dependencies are
   declared. This may include [shared npm
   dependencies][sharing-npm-dependencies] that are provided by the integrator
   in the case where the [Feature Service is provided by a Feature
   App][own-feature-service-definitions] instead of the integrator, i.e. the
   Feature Service is included in a different bundle than the integrator bundle.

   External dependencies are declared with their external name as key, and a
   [semver version range][semver] as value, e.g. `{rxjs: '^6.4.0'}`.

## `optionalDependencies`

The `optionalDependencies.featureServices` map contains all Feature Service
dependencies for which the depending Feature Service handles their absence
gracefully. If one of those dependencies can't be fulfilled, the
`FeatureServiceRegistry` will only log an info message.

Feature Service dependencies are declared with their ID as key, and a [semver
version range][semver] as value, e.g.
`{'acme:other-feature-service': '^2.0.0'}`.

> **Note:**  
> Optional external dependencies (i.e. `optionalDependencies.externals`) are not
> yet supported (see [#245][issue-245]).

## `create`

The `create` method of a Feature Service definition is called exactly once by
the `FeatureServiceRegistry`. It should store, and possibly initialize, any
shared state. The method takes the single argument `env`, which has the
following properties:

1. `featureServices` — An object of required Feature Services that are
   semver-compatible with the declared dependencies in the Feature Service
   definition:

   ```js
   const myFeatureServiceDefinition = {
     id: 'acme:my-feature-service',

     dependencies: {
       featureServices: {
         'acme:other-feature-service': '^2.0.0',
       },
     },

     create(env) {
       const otherFeatureService =
         env.featureServices['acme:other-feature-service'];

       otherFeatureService.foo(42);

       // ...
     },
   };
   ```

The `create` method must return an object that provides an implementation of the
`FeatureServiceBinder` type of the [`@feature-hub/core`][core-api] package for
each supported major version. The Feature Service binder is a function that is
called for each consumer with its `consumerId` string as the first argument, and
optionally its `consumerName` string as the second argument. It returns a
Feature Service binding with a consumer-bound `featureService` and an optional
`unbind` method. The `FeatureServiceRegistry` passes this consumer-bound
`featureService` to the consumer's `create` method via the `env.featureServices`
argument.

If within its `create` method a Feature Service concludes that it can not be
created, e.g. because of a certain configuration or missing requirement, it
might also return `undefined`. Such a Feature Service should document for its
consumers that they must declare the dependency in `optionalDependencies`.

## Providing a Versioned API

A Feature Service provider can support multiple major versions at the same time
which have access to the same underlying shared state. With this in mind, a
simple counter Feature Service could look like this:

```js
const myFeatureServiceDefinition = {
  id: 'acme:my-feature-service',

  create(env) {
    let count = 0;

    const v1 = (consumerId) => ({
      featureService: {
        plus() {
          count += 1;
        },

        minus() {
          count -= 1;
        },
      },
    });

    return {'1.0.0': v1};
  },
};
```

Let's say after the first release of this Feature Service, the Feature Service
provider noticed that there is no way to retrieve the current count. Therefore,
they introduce the `getCount` method in version `1.1.0`:

```js
const myFeatureServiceDefinition = {
  id: 'acme:my-feature-service',

  create(env) {
    let count = 0;

    const v1 = (consumerId) => ({
      featureService: {
        plus() {
          count += 1;
        },

        minus() {
          count -= 1;
        },

        getCount() {
          return count;
        },
      },
    });

    return {'1.1.0': v1};
  },
};
```

The version of a Feature Service needs to be incremented in a semver-compatible
manner. In this case, a method is added, leading to a minor version bump.

In general, breaking changes should be avoided. If a Feature Service provider
still needs to make breaking changes, a new Feature Service implementation for
the next major version should be added. Old major versions should still be
supported.

Furthermore, it is possible to add deprecation warnings, and later remove
deprecated APIs.

In our example the Feature Service provider decides to rename the `plus` /
`minus` methods to `increment` / `decrement` in a new version `2.0.0`, and adds
deprecation warnings to the methods of version `1.1.0`:

```js
const myFeatureServiceDefinition = {
  id: 'acme:my-feature-service',

  create(env) {
    let count = 0;

    const getCount = () => count;
    const decrement = () => void --count;
    const increment = () => void ++count;

    const v1 = (consumerId) => ({
      featureService: {
        getCount,

        plus() {
          console.warn('Deprecation warning: use increment instead of plus.');
          increment();
        },

        minus() {
          console.warn('Deprecation warning: use decrement instead of minus.');
          decrement();
        },
      },
    });

    const v2 = (consumerId) => ({
      featureService: {getCount, increment, decrement},
    });

    return {'1.1.0': v1, '2.0.0': v2};
  },
};
```

> **Note:**  
> A Feature Service needs to provide only one implementation per major version,
> since minor versions only add new features, and thus the latest minor version
> also satisfies the consumers of all previous minor versions of the same major
> version. For this reason, the `FeatureServiceRegistry` coerces the versions
> that consumers define in their [dependencies](#dependencies) to [caret
> ranges][semver-caret-range]. Thus, it is safe to to provide only one
> implementation per major version.

## Managing Consumer-specific State

Declaring a Feature Service binder (for each major version) allows Feature
Service providers to create and destroy consumer-specific state.

Let's assume our counter Feature Service, instead of handling a global count, is
supposed to handle consumer-specific counts, as well as expose a total of all
consumer-specific counts.

With our Feature Service binders, this could be implemented like this:

```js
const myFeatureServiceDefinition = {
  id: 'acme:my-feature-service',

  create(env) {
    // Shared state lives here.
    let consumerCounts = {};

    const v1 = (consumerId) => {
      // Consumer-specific state lives here.
      consumerCounts[consumerId] = 0;

      const featureService = {
        increment() {
          consumerCounts[consumerId] += 1;
        },

        decrement() {
          consumerCounts[consumerId] -= 1;
        },

        getCount() {
          return consumerCounts[consumerId];
        },

        getTotalCount() {
          return Object.values(consumerCounts).reduce(
            (totalCount, consumerCount) => totalCount + consumerCount,
            0
          );
        },
      };

      const unbind = () => {
        // Cleaning up the consumer-specific state.
        delete consumerCounts[consumerId];
      };

      return {featureService, unbind};
    };

    return {'1.0.0': v1};
  },
};
```

## When to use the `consumerName` instead of the `consumerId`

In contrast to the `consumerId`, the `consumerName` must not be unique. It can
be used for display purposes, logging, looking up Feature App configuration meta
data, etc., e.g. a Logger Feature Service could use it like this:

```js
const createConsumerConsole = (consumer) => {
  const prefixArgs = [`%c${consumer}`, 'font-weight: bold'];

  return {
    trace: console.trace.bind(console, ...prefixArgs),
    debug: console.debug.bind(console, ...prefixArgs),
    info: console.info.bind(console, ...prefixArgs),
    warn: console.warn.bind(console, ...prefixArgs),
    error: console.error.bind(console, ...prefixArgs),
  };
};

const defineLogger = (createConsumerLogger = createConsumerConsole) => ({
  id: 'demo:logger',

  create: () => ({
    '1.0.0': (consumerId, consumerName = consumerId) => ({
      featureService: createConsumerLogger(consumerName),
    }),
  }),
});
```

[core-api]: /api/modules/core.html
[feature-service-binder]:
  /docs/guides/writing-a-feature-service#feature-service-binder
[providing-configs]: /docs/guides/integrating-the-feature-hub#providing-configs
[sharing-npm-dependencies]: /docs/guides/sharing-npm-dependencies
[semver]: https://semver.org
[semver-caret-range]:
  https://docs.npmjs.com/misc/semver#caret-ranges-123-025-004
[semver-tilde-range]: https://docs.npmjs.com/misc/semver#tilde-ranges-123-12-1
[own-feature-service-definitions]:
  /docs/guides/writing-a-feature-app#ownfeatureservicedefinitions
[issue-245]: https://github.com/sinnerschrader/feature-hub/issues/245
