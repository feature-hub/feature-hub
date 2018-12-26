---
id: writing-a-feature-service
title: Writing a Feature Service
sidebar_label: Writing a Feature Service
---

A Feature Service module must export a definition object. It consists of an
`id`, an optional `dependencies` object, and a `create` method:

```js
export const myFeatureServiceDefinition = {
  id: 'acme:my-feature-service',

  dependencies: {
    'acme:other-feature-service': '^2.0'
  },

  create(env) {
    // ...
  }
};
```

## Naming a Feature Service

A Feature Service definition must declare an `id`. It is recommended to use
namespaces for the Feature Service ID to avoid naming conflicts, e.g.:

```js
const id = 'acme:my-feature-service';
```

This ID is used to look up the config for a Feature Service. Furthermore, it is
used as a consumer ID for the [bindings][providing-consumer-specific-state] of
the Feature Services that a Feature Service depends on.

## Depending on Other Feature Services

In `dependencies`, required Feature Services are declared with their ID and a
[semver][semver] version string:

```js
const dependencies = {
  'acme:other-feature-service': '^2.0'
};
```

## Instantiating a Feature Service

The `create` method of a Feature Service definition is called exactly once by
the `FeatureServiceRegistry`. It should store, and possibly initialize, any
shared state. The method takes the single argument `env`, which has the
following properties:

1.  `config`: A Feature Service config object that is
    [provided][providing-config-objects] by the integrator.
1.  `featureServices`: An object of required Feature Services that are
    [semver-compatible][semver] with the declared dependencies in the Feature
    App definition.

### Providing a Versioned API

A Feature Service provider can support multiple major versions at the same time
which have access to the same underlying shared state. The `create` method must
return an object with a so-called Feature Service binder for each supported
major version. The Feature Service binder is a function that is called for each
consumer. It returns a Feature Service binding with a consumer-bound
`featureService` and an optional `unbind` method. The `FeatureServiceRegistry`
passes the bound Feature Service to the consumer's `create` method.

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
they introduce the `getCount` method in version `1.1`:

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

The version of a Feature Service needs to be incremented in a
[semver-compatible][semver] manner (without the need for a patch version). In
this case, a method is added, leading to a minor version bump.

In general, breaking changes should be avoided. If a Feature Service provider
still needs to make breaking changes, a new Feature Service implementation for
the next major version should be added. Old major versions should still be
supported.

Furthermore, it is possible to add deprecation warnings, and later remove
deprecated APIs.

In our example the Feature Service provider decides to rename the `plus`/`minus`
methods to `increment`/`decrement` and adds deprecation warnings:

```js
function create(env) {
  let count = env.config.initialCount || 0;

  const getCount = () => count;
  const decrement = () => void --count;
  const increment = () => void ++count;

  const v1 = uniqueConsumerId => ({
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

  const v2 = uniqueConsumerId => ({
    featureService: {getCount, increment, decrement}
  });

  return {'1.1': v1, '2.0': v2};
}
```

### Providing Consumer-specific State

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

[providing-config-objects]:
  /docs/guides/integrating-the-feature-hub#providing-config-objects
[providing-consumer-specific-state]:
  /docs/guides/writing-a-feature-service#providing-consumer-specific-state
[semver]: https://semver.org
