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
   integrator][feature-app-configs]^1^:

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

1. `featureAppId` — The ID that the integrator^1^ has assigned to the Feature
   App instance. This ID is used as a consumer ID for [binding the required
   Feature Services][feature-service-create] to the Feature App.

1. `featureAppName` — The name that the integrator^1^ might have assigned to the
   Feature App. This name is used as a consumer name for [binding the required
   Feature Services][feature-service-create] to the Feature App. In contrast to
   the `featureAppId`, the name must not be unique. It can be used by required
   Feature Services for display purposes, logging, looking up Feature App
   configuration meta data, etc.

1. `baseUrl` — A base URL to be used for referencing the Feature App's own
   resources. It is only set in the `env` if the integrator^1^ has defined a
   `baseUrl` on the corresponding
   [`FeatureAppLoader`][feature-app-loader-base-url] or
   [`FeatureAppContainer`][feature-app-container-base-url].

1. `done` — A callback that the integrator^1^ might have defined. A short-lived
   Feature App can call this function when it has completed its task, thus
   giving the integrator^1^ a hint, that it can be removed. For example, if the
   Feature App was opened in a layer, the integrator^1^ could close the layer
   when `done()` is called.

The return value of the `create` method can vary depending on the integration
solution used. Assuming the [`@feature-hub/react`][react-api] package is used, a
Feature App can be either a [React Feature App](#react-feature-app) or a
[DOM Feature App](#dom-feature-app).

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
are used to allow an integrator^1^ to hide an already rendered Feature App
visually and display a custom loading UI instead. This feature is for
client-side rendering only.

A Feature App can declare this loading stage by passing a `Promise` in the
object returned from their `create` function with the key `loadingPromise`. Once
the promise resolves, the loading is considered done. If it rejects, the Feature
App will be considered as crashed, and the integrator^1^ can use the rejection
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

## Bundling a Feature App

For the `FeatureAppManager` to be able to load Feature Apps from a remote
location, Feature App modules must be bundled. The module type of a Feature App
bundle must be chosen based on the [provided module loaders of the
integrators][module-loader] it intends to be loaded into.

### Client Bundles

Out of the box, the Feature Hub provides two client-side module loaders.

#### AMD Module Loader

To build an AMD Feature App module bundle, any module bundler can be used that
can produce an AMD or UMD bundle.

How npm dependencies can be shared using AMD is described in the ["Sharing npm
Dependencies" guide][sharing-npm-dependencies-amd].

#### Webpack Module Federation Loader

To build a [federated module][module-federation], Webpack must be used as module
bundler.

Here is an example of a Webpack config for a federated Feature App module:

```js
module.exports = {
  entry: {}, // intentionally left empty
  output: {
    filename: 'some-federated-feature-app.js',
    publicPath: 'auto',
  },
  plugins: [
    new webpack.container.ModuleFederationPlugin({
      name: '__feature_hub_feature_app_module_container__',
      exposes: {
        featureAppModule: path.join(__dirname, './some-feature-app'),
      },
    }),
  ],
};
```

How npm dependencies can be shared using Webpack Module Federation is described
in the ["Sharing npm Dependencies" guide][sharing-npm-dependencies-federation].

> **There are two important naming conventions a Feature App's Webpack config
> must follow:**
>
> 1. The `name` of the remote Feature App module container must be
>    `'__feature_hub_feature_app_module_container__'`.
>
> 1. The Feature App module (containing the Feature App definition as default
>    export) must be exposed by the container as `featureAppModule`.

### Server Bundles

To build a CommonJS Feature App module bundle for [server-side
rendering][server-side-rendering], any module bundler can be used that can
produce a CommonJS or UMD bundle. The target of this bundle must be Node.js.

How npm dependencies can be shared on the server is described in the ["Sharing
npm Dependencies" guide][sharing-npm-dependencies-commonjs].

---

1. The "integrator" in this case can also be [another Feature
   App][feature-app-in-feature-app].

[feature-app-in-feature-app]: /docs/guides/feature-app-in-feature-app
[feature-app-loader-base-url]: /docs/guides/integrating-the-feature-hub#baseurl
[feature-app-container-base-url]:
  /docs/guides/integrating-the-feature-hub#baseurl-1
[feature-app-configs]:
  /docs/guides/integrating-the-feature-hub#feature-app-configs
[module-loader]: /docs/guides/integrating-the-feature-hub#module-loader
[placing-feature-apps-on-a-web-page-using-react]:
  /docs/guides/integrating-the-feature-hub#placing-feature-apps-on-a-web-page-using-react
[placing-feature-apps-on-a-web-page-using-web-components]:
  /docs/guides/integrating-the-feature-hub/#placing-feature-apps-on-a-web-page-using-web-components
[server-side-rendering]: /docs/guides/server-side-rendering
[sharing-npm-dependencies]: /docs/guides/sharing-npm-dependencies
[sharing-npm-dependencies-amd]: /docs/guides/sharing-npm-dependencies#amd
[sharing-npm-dependencies-federation]:
  /docs/guides/sharing-npm-dependencies#webpack-module-federation
[sharing-npm-dependencies-commonjs]:
  /docs/guides/sharing-npm-dependencies#commonjs
[feature-service-create]: /docs/guides/writing-a-feature-service#create
[providing-a-versioned-api]:
  /docs/guides/writing-a-feature-service#providing-a-versioned-api
[async-ssr-manager-api]: /api/modules/async_ssr_manager.html
[dom-api]: /api/modules/dom.html
[react-api]: /api/modules/react.html
[semver]: https://semver.org
[semver-caret-range]:
  https://docs.npmjs.com/misc/semver#caret-ranges-123-025-004
[semver-tilde-range]: https://docs.npmjs.com/misc/semver#tilde-ranges-123-12-1
[issue-245]: https://github.com/sinnerschrader/feature-hub/issues/245
[demo-react-loading-ui]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/react-loading-ui
[module-federation]: https://webpack.js.org/concepts/module-federation/
