---
id: writing-a-feature-app
title: Writing a Feature App
sidebar_label: Writing a Feature App
---

A Feature App is described by a consumer definition object. It consists of
optional `dependencies` and `optionalDependencies` objects, and a `create`
method:

```js
const myFeatureAppDefinition = {
  dependencies: {
    featureServices: {
      'acme:some-feature-service': '^2.0.0',
    },
    externals: {
      react: '^16.7.0',
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

If a Feature App module is to be loaded asynchronously with the
`FeatureAppManager`, it must provide a definition object as its default export:

```js
export default myFeatureAppDefinition;
```

## `dependencies`

The `dependencies` map can contain two types of required dependencies:

1. With `dependencies.featureServices` all required Feature Services are
   declared. If one of those dependencies can't be fulfilled, the Feature App
   won't be created. This means the Feature App can be sure that those
   dependencies are always present when it is created.

   Feature Service dependencies are declared with their ID as key, and a [semver
   version range][semver] as value, e.g.
   `{'acme:some-feature-service': '^2.0.0'}`. Since [Feature Services only
   provide the latest minor version for each major
   version][providing-a-versioned-api], a [caret range][semver-caret-range]
   should be used here. If instead an exact version or a [tilde
   range][semver-tilde-range] is used, this will be coerced to a caret range by
   the `Feature ServiceRegistry`.

1. With `dependencies.externals` all required external dependencies are
   declared. This may include [shared npm
   dependencies][sharing-npm-dependencies] that are provided by the integrator.

   External dependencies are declared with their external name as key, and a
   [semver version range][semver] as value, e.g. `{react: '^16.7.0'}`.

## `optionalDependencies`

The `optionalDependencies.featureServices` map contains all Feature Service
dependencies for which the Feature App handles their absence gracefully. If one
of those dependencies can't be fulfilled, the `FeatureServiceRegistry` will only
log an info message.

Feature Service dependencies are declared with their ID as key, and a [semver
version range][semver] as value, e.g. `{'acme:some-feature-service': '^2.0.0'}`.
Since [Feature Services only provide the latest minor version for each major
version][providing-a-versioned-api], a [caret range][semver-caret-range] should
be used here. If instead an exact version or a [tilde range][semver-tilde-range]
is used, this will be coerced to a caret range by the `Feature ServiceRegistry`.

> **Note:**  
> Optional external dependencies (i.e. `optionalDependencies.externals`) are not
> yet supported (see [#245][issue-245]).

## `create`

The `create` method takes the single argument `env`, which has the following
properties:

1. `config` — A [config object that is provided by the
   integrator][feature-app-configs]:

   ```js
   const myFeatureAppDefinition = {
     create(env) {
       const {foo} = env.config;

       // ...
     },
   };
   ```

1. `featureServices` — An object of required Feature Services that are
   semver-compatible with the declared dependencies in the Feature App
   definition:

   ```js
   const myFeatureAppDefinition = {
     dependencies: {
       featureServices: {
         'acme:some-feature-service': '^2.0.0',
       },
     },

     create(env) {
       const someFeatureService =
         env.featureServices['acme:some-feature-service'];

       someFeatureService.foo(42);

       // ...
     },
   };
   ```

1. `featureAppId` — The ID that the integrator has assigned to the Feature App
   instance. This ID is used as a consumer ID for [binding the required Feature
   Services][feature-service-binder] to the Feature App.

1. `baseUrl` — A base URL to be used for referencing the Feature App's own
   resources. It is only set in the `env` if the integrator has defined a
   `baseUrl` on the corresponding
   [`FeatureAppLoader`][feature-app-loader-base-url] or
   [`FeatureAppContainer`][feature-app-container-base-url].

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
  dependencies: {
    featureServices: {
      'acme:my-feature-service': '^1.0.0',
    },
  },

  ownFeatureServiceDefinitions: [myFeatureServiceDefinition],

  create(env) {
    const myFeatureService = env.featureServices['acme:my-feature-service'];

    // ...
  },
};
```

This technique allows teams to quickly get Feature Apps off the ground, without
being dependent on the integrator. However, as soon as other teams need to use
this Feature Service, it should be published and included in the global set of
Feature Services by the integrator.

> **Note:**  
> If the Feature Service to be registered has already been registered, the new
> Feature Service is ignored and a warning is emitted.

## Implementing a Feature App for an Integrator That Uses React

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
  create(env) {
    return {
      render() {
        return <div>Foo</div>;
      },
    };
  },
};
```

> **Note:**  
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
  create(env) {
    return {
      attachTo(container) {
        container.innerText = 'Foo';
      },
    };
  },
};
```

### Loading UIs provided by the React Integrator

Both kinds of Feature Apps can specify a loading stage for Feature Apps, which
are used to allow an Integrator to hide an already rendered Feature App visually
and display a custom loading UI instead. This feature is for client-side
rendering only.

A Feature App can declare this loading stage by passing a `Promise` in the
object returned from their `create` function with the key `loadingPromise`. Once
the promise resolves, the loading is considered done. If it rejects, the Feature
App will be considered as crashed, and the Integrator can use the rejection
payload to display a custom Error UI.

```js
const myFeatureAppDefinition = {
  create(env) {
    const dataPromise = fetchDataFromAPI();

    return {
      loadingPromise: dataPromise,

      render() {
        return <App dataPromise={dataPromise}>;
      }
    };
  }
};
```

> **Note:**  
> If you want the rendered App to control when it is done loading, you can pass
> the promise `resolve` and `reject` functions into the App using your render
> method. An example for this is implemented in the [`react-loading-ui`
> demo][demo-react-loading-ui].

> **Note:**  
> If a similar loading stage (after rendering started) is needed for server-side
> rendering, for example to wait for a data layer like a router to resolve all
> dependencies, it can be implemented using the
> [`@feature-hub/async-ssr-manager`][async-ssr-manager-api]'s `scheduleRerender`
> API.

## Implementing a Feature App for an Integrator That Uses Web Components

If the targeted integrator is using the [`@feature-hub/dom`][dom-api] package, a
Feature App needs to implement the `DomFeatureApp` interface that the package
defines. Since this interface is compatible with the `DomFeatureApp` interface
defined by [`@feature-hub/react`][react-api], this Feature App will also be
compatible with an integrator that uses React.

A DOM Feature App allows the use of arbitrary frontend technologies such as
Vue.js, Angular, or React, and is [placed on the web page using Web
Components][placing-feature-apps-on-a-web-page-using-web-components]. The
Feature App will automatically be enclosed in its own shadow DOM. Its
definition's `create` method returns a Feature App instance with an `attachTo`
method that accepts a DOM container element:

```js
const myFeatureAppDefinition = {
  create(env) {
    return {
      attachTo(container) {
        container.innerText = 'Foo';
      },
    };
  },
};
```

[dom-feature-app]: /docs/guides/writing-a-feature-app#dom-feature-app
[feature-service-binder]:
  /docs/guides/writing-a-feature-service#feature-service-binder
[feature-app-loader-base-url]: /docs/guides/integrating-the-feature-hub#baseurl
[feature-app-container-base-url]:
  /docs/guides/integrating-the-feature-hub#baseurl-1
[placing-feature-apps-on-a-web-page-using-react]:
  /docs/guides/integrating-the-feature-hub#placing-feature-apps-on-a-web-page-using-react
[placing-feature-apps-on-a-web-page-using-web-components]:
  /docs/guides/integrating-the-feature-hub/#placing-feature-apps-on-a-web-page-using-web-components
[feature-app-configs]:
  /docs/guides/integrating-the-feature-hub#feature-app-configs
[dom-api]: /api/modules/dom.html
[react-api]: /api/modules/react.html
[react-feature-app]: /docs/guides/writing-a-feature-app#react-feature-app
[sharing-npm-dependencies]: /docs/guides/sharing-npm-dependencies
[semver]: https://semver.org
[semver-caret-range]:
  https://docs.npmjs.com/misc/semver#caret-ranges-123-025-004
[semver-tilde-range]: https://docs.npmjs.com/misc/semver#tilde-ranges-123-12-1
[issue-245]: https://github.com/sinnerschrader/feature-hub/issues/245
[providing-a-versioned-api]:
  /docs/guides/writing-a-feature-service#providing-a-versioned-api
[async-ssr-manager-api]: /api/modules/async_ssr_manager.html
[demo-react-loading-ui]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/react-loading-ui
