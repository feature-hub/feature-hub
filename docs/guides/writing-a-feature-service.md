---
id: writing-a-feature-service
title: Writing a Feature Service
sidebar_label: Writing a Feature Service
---

A Feature Service is described by a provider definition object. It consists of
an `id`, an optional `dependencies` object, and a `create` method:

```js
const myFeatureServiceDefinition = {
  id: 'acme:my-feature-service',

  dependencies: {
    'acme:other-feature-service': '^2.0'
  },

  optionalDependencies: {
    'acme:optional-feature-service': '^1.3'
  },

  create(env) {
    // ...
  }
};
```

## `id`

It is recommended to use namespaces for the Feature Service ID to avoid naming
conflicts, e.g. `'acme:my-feature-service'`. This ID is used to look up the
config for a Feature Service. Furthermore, it is used as a consumer ID for
[binding the required Feature Services][feature-service-binder] to the dependent
Feature Service.

## `dependencies` & `optionalDependencies`

Feature Service dependencies are declared with their ID and a [semver version
string][semver], e.g. `{'acme:other-feature-service': '^2.0'}`. There are two
dependency maps.

The `dependencies` map contains all required Feature Services. If one of those
dependencies can't be fulfilled, Feature Service registration will fail. This
means the Feature Service can be sure that those dependencies are always present
when it is created.

The `optionalDependencies` map contains all dependencies for which the Feature
Service handles their absence gracefully. If one of those dependencies can't be
fulfilled, the `FeatureServiceRegistry` will only log an info message.

## `create`

The `create` method of a Feature Service definition is called exactly once by
the `FeatureServiceRegistry`. It should store, and possibly initialize, any
shared state. The method takes the single argument `env`, which has the
following properties:

1. `config` — A Feature Service [config object that is provided by the
   integrator][providing-configs]:

   ```js
   const myFeatureServiceDefinition = {
     id: 'acme:my-feature-service',

     create(env) {
       const {foo} = env.config;

       // ...
     }
   };
   ```

1. `featureServices` — An object of required Feature Services that are
   semver-compatible with the declared dependencies in the Feature Service
   definition:

   ```js
   const myFeatureServiceDefinition = {
     id: 'acme:my-feature-service',

     dependencies: {
       'acme:other-feature-service': '^2.0'
     },

     create(env) {
       const otherFeatureService =
         env.featureServices['acme:other-feature-service'];

       otherFeatureService.foo(42);

       // ...
     }
   };
   ```

## Feature Service Binder

The `create` method must return an object that provides an implementation of the
`FeatureServiceBinder` type of the [`@feature-hub/core`][core-api] package for
each supported major version. The Feature Service binder is a function that is
called for each consumer with its `consumerUid` string as the first argument. It
returns a Feature Service binding with a consumer-bound `featureService` and an
optional `unbind` method. The `FeatureServiceRegistry` passes this
consumer-bound `featureService` to the consumer's `create` method via the
`env.featureServices` argument.

## Providing a Versioned API

A Feature Service provider can support multiple major versions at the same time
which have access to the same underlying shared state. With this in mind, a
simple counter Feature Service could look like this:

```js
const myFeatureServiceDefinition = {
  id: 'acme:my-feature-service',

  create(env) {
    let count = env.config.initialCount || 0;

    const v1 = consumerUid => ({
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
};
```

Let's say after the first release of this Feature Service, the Feature Service
provider noticed that there is no way to retrieve the current count. Therefore,
they introduce the `getCount` method in version `1.1`:

```js
const myFeatureServiceDefinition = {
  id: 'acme:my-feature-service',

  create(env) {
    let count = env.config.initialCount || 0;

    const v1 = consumerUid => ({
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
};
```

The version of a Feature Service needs to be incremented in a semver-compatible
manner (without the need for a patch version). In this case, a method is added,
leading to a minor version bump.

In general, breaking changes should be avoided. If a Feature Service provider
still needs to make breaking changes, a new Feature Service implementation for
the next major version should be added. Old major versions should still be
supported.

Furthermore, it is possible to add deprecation warnings, and later remove
deprecated APIs.

In our example the Feature Service provider decides to rename the `plus` /
`minus` methods to `increment` / `decrement` and adds deprecation warnings:

```js
const myFeatureServiceDefinition = {
  id: 'acme:my-feature-service',

  create(env) {
    let count = env.config.initialCount || 0;

    const getCount = () => count;
    const decrement = () => void --count;
    const increment = () => void ++count;

    const v1 = consumerUid => ({
      featureService: {
        getCount,

        plus() {
          console.warn('Deprecation warning: use increment instead of plus.');
          increment();
        },

        minus() {
          console.warn('Deprecation warning: use decrement instead of minus.');
          decrement();
        }
      }
    });

    const v2 = consumerUid => ({
      featureService: {getCount, increment, decrement}
    });

    return {'1.1': v1, '2.0': v2};
  }
};
```

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

    const v1 = consumerUid => {
      // Consumer-specific state lives here.
      consumerCounts[consumerUid] = 0;

      const featureService = {
        increment() {
          consumerCounts[consumerUid] += 1;
        },

        decrement() {
          consumerCounts[consumerUid] -= 1;
        },

        getCount() {
          return consumerCounts[consumerUid];
        },

        getTotalCount() {
          return Object.values(consumerCounts).reduce(
            (totalCount, consumerCount) => totalCount + consumerCount,
            0
          );
        }
      };

      const unbind = () => {
        // Cleaning up the consumer-specific state.
        delete consumerCounts[consumerUid];
      };

      return {featureService, unbind};
    };

    return {'1.0': v1};
  }
};
```

[core-api]: /@feature-hub/core/
[feature-service-binder]:
  /docs/guides/writing-a-feature-service#feature-service-binder
[providing-configs]: /docs/guides/integrating-the-feature-hub#providing-configs
[semver]: https://semver.org
