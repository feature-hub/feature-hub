---
id: writing-a-feature-app
title: Writing a Feature App
sidebar_label: Writing a Feature App
---

A Feature App is described by a consumer definition object. It consists of an
`id`, `dependencies` and/or `optionalDependencies` objects, and a `create`
method:

```js
const myFeatureAppDefinition = {
  id: 'acme:my-feature-app',

  dependencies: {
    featureServices: {
      'acme:some-feature-service': '^2.0.0'
    },
    externals: {
      react: '^16.7.0'
    }
  },

  optionalDependencies: {
    featureServices: {
      'acme:optional-feature-service': '^1.3.0'
    }
  },

  create(env) {
    // ...
  }
};
```

If a Feature App module is to be loaded asynchronously with the
`FeatureAppManager`, it must provide a definition object as its default export:

```js
export default myFeatureAppDefinition;
```

## `id`

It is recommended to use namespaces for the Feature App ID to avoid naming
conflicts, e.g. `'acme:my-feature-app'`. This ID is used to look up the config
for a Feature App. Furthermore, it is used as a consumer ID for [binding the
required Feature Services][feature-service-binder] to the dependent Feature App.

## `dependencies`

The `dependencies` map can contain two types of required dependencies:

1. With `dependencies.featureServices` all required Feature Services are
   declared. If one of those dependencies can't be fulfilled, the Feature App
   won't be created. This means the Feature App can be sure that those
   dependencies are always present when it is created.

   Feature Service dependencies are declared with their ID as key, and a [semver
   version range][semver] as value, e.g.
   `{'acme:some-feature-service': '^2.0.0'}`.

1. With `dependencies.externals` all required external dependencies are
   declared. This may include [shared npm
   dependencies][sharing-npm-dependencies] that are provided by the integrator.

   External dependencies are declared, for example, with their module name as
   key, and a [semver version range][semver] as value, e.g.
   `{react: '^16.7.0'}`.

## `optionalDependencies`

The `optionalDependencies.featureServices` map contains all Feature Service
dependencies for which the Feature App handles their absence gracefully. If one
of those dependencies can't be fulfilled, the `FeatureServiceRegistry` will only
log an info message.

Feature Service dependencies are declared with their ID as key, and a [semver
version range][semver] as value, e.g. `{'acme:some-feature-service': '^2.0.0'}`.

> Optional external dependencies (i.e. `optionalDependencies.externals`) are not
> yet supported (see [#245][issue-245]).

## `create`

The `create` method takes the single argument `env`, which has the following
properties:

1. `config` — A Feature App [config object that is provided by the
   integrator][providing-configs]:

   ```js
   const myFeatureAppDefinition = {
     id: 'acme:my-feature-app',

     create(env) {
       const {foo} = env.config;

       // ...
     }
   };
   ```

1. `featureServices` — An object of required Feature Services that are
   semver-compatible with the declared dependencies in the Feature App
   definition:

   ```js
   const myFeatureAppDefinition = {
     id: 'acme:my-feature-app',

     dependencies: {
       featureServices: {
         'acme:some-feature-service': '^2.0.0'
       }
     },

     create(env) {
       const someFeatureService =
         env.featureServices['acme:some-feature-service'];

       someFeatureService.foo(42);

       // ...
     }
   };
   ```

1. `idSpecifier` — An optional [ID specifier][idspecifier] that distinguishes
   the Feature App instance from other Feature App instances with the same ID.

The return value of the `create` method can vary depending on the integration
solution used. Assuming the [`@feature-hub/react`][react-api] package is used, a
Feature App can be either a [React Feature App][react-feature-app] or a [DOM
Feature App][dom-feature-app].

## `ownFeatureServiceDefinitions`

A Feature App can also register its own Feature Services by declaring
`ownFeatureServiceDefinitions`:

```js
import {myFeatureServiceDefinition} from './my-feature-service';
```

```js
const myFeatureAppDefinition = {
  id: 'acme:my-feature-app',

  dependencies: {
    featureServices: {
      'acme:my-feature-service': '^1.0.0'
    }
  },

  ownFeatureServiceDefinitions: [myFeatureServiceDefinition],

  create(env) {
    const myFeatureService = env.featureServices['acme:my-feature-service'];

    // ...
  }
};
```

This technique allows teams to quickly get Feature Apps off the ground, without
being dependent on the integrator. However, as soon as other teams need to use
this Feature Service, it should be published and included in the global set of
Feature Services by the integrator.

> If the Feature Service to be registered has already been registered, the new
> Feature Service is ignored and a warning is emitted.

## Implementing a Feature App Using React

The [`@feature-hub/react`][react-api] package defines two interfaces,
`ReactFeatureApp` and `DomFeatureApp`. A Feature App that implements one of
these interfaces can be [placed on a web page using the `FeatureAppLoader` or
`FeatureAppContainer`
components][placing-feature-apps-on-a-web-page-using-react].

### React Feature App

A React Feature App definition's `create` method returns a Feature App instance
with a `render` method that itself returns a `ReactNode`:

```js
const myFeatureAppDefinition = {
  id: 'acme:my-feature-app',

  create(env) {
    return {
      render() {
        return <div>Foo</div>;
      }
    };
  }
};
```

> Since this element is directly rendered by React, the standard React lifecyle
> methods can be used (if `render` returns an instance of a React
> `ComponentClass`).

### DOM Feature App

A DOM Feature App allows the use of other frontend technologies such as Vue.js
or Angular, although it is placed on a web page using React. Its definition's
`create` method returns a Feature App instance with an `attachTo` method that
accepts a DOM container element:

```js
const myFeatureAppDefinition = {
  id: 'acme:my-feature-app',

  create(env) {
    return {
      attachTo(container) {
        container.innerText = 'Foo';
      }
    };
  }
};
```

[dom-feature-app]: /docs/guides/writing-a-feature-app#dom-feature-app
[feature-service-binder]:
  /docs/guides/writing-a-feature-service#feature-service-binder
[idspecifier]: /docs/guides/integrating-the-feature-hub#idspecifier
[placing-feature-apps-on-a-web-page-using-react]:
  /docs/guides/integrating-the-feature-hub#placing-feature-apps-on-a-web-page-using-react
[providing-configs]: /docs/guides/integrating-the-feature-hub#providing-configs
[react-api]: /@feature-hub/react/
[react-feature-app]: /docs/guides/writing-a-feature-app#react-feature-app
[sharing-npm-dependencies]: /docs/guides/sharing-npm-dependencies
[semver]: https://semver.org
[issue-245]: https://github.com/sinnerschrader/feature-hub/issues/245
