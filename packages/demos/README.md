# @feature-hub/demos

[![Website][website-badge]][website]

A collection of demos (including integration tests) for the Feature Hub.

## Getting Started

Go to the monorepo top-level directory and install all dependencies:

```sh
yarn
```

Now run one of the following demos:

### [AMD Module Loader](src/module-loader-amd)

Demonstrates:

- how the AMD module loader can be provided to the `FeatureAppManager` so that
  Feature Apps that are deployed as AMD bundles can be loaded in the client

```sh
yarn watch:demo module-loader-amd
```

### [CommonJS Module Loader](src/module-loader-commonjs)

Demonstrates:

- how the CommonJS module loader can be provided to the `FeatureAppManager` so
  that Feature Apps that are deployed as CommonJS bundles can be loaded on the
  server

```sh
yarn watch:demo module-loader-commonjs
```

### [Webpack Module Federation Loader](src/module-loader-federation)

Demonstrates:

- how the Module Federation loader can be provided to the `FeatureAppManager` so
  that Feature Apps that are deployed as federated modules can be loaded in the
  client
- how libraries can be shared by the Integrator to be consumed by the Feature
  Apps
- how Feature Apps can share libraries with each other that are not provided by
  the Integrator

```sh
yarn watch:demo module-loader-federation
```

### [Multiple Module Loaders](src/module-loader-multiple)

Demonstrates:

- how multiple module loaders can be provided to the `FeatureAppManager` so that
  Feature Apps that are deployed as federated or AMD modules can be loaded
  simultaneously in the client

```sh
yarn watch:demo module-loader-multiple
```

### [Feature App in Feature App](src/feature-app-in-feature-app)

Demonstrates:

- how a React Feature App can render another Feature App
- how externals must be configured to make the feature work
- how the AMD module loader can be used to provide externals

```sh
yarn watch:demo feature-app-in-feature-app
```

### [History Service](src/history-service)

Demonstrates:

- how multiple consumers can share the browser URL through the History Service
- how the integrator can propagate the server request URL to the History Service
  (via the Server Request Provider)

```sh
yarn watch:demo history-service
```

### [Server-Side Rendering](src/server-side-rendering)

Demonstrates:

- how the Async SSR Manager can be used to manage asynchronous server-side
  rendering with React
- how the Serialized State Manager can be used to transfer the state of
  server-rendered Feature Apps to the client
- how server-rendered Feature Apps can be preloaded in the client before
  hydration
- how multiple Feature App module types can be handled during hydration
- how external stylesheets of Feature Apps can be added to the document during
  SSR

```sh
yarn watch:demo server-side-rendering
```

### [Custom Logging](src/custom-logging)

Demonstrates:

- how to configure custom loggers for the server and client, using [pino][pino]
  on the server, and a customized `console` on the client

```sh
yarn watch:demo custom-logging
```

### [React Loading And Error UI](src/react-loading-and-error-ui)

Demonstrates:

- how to define a custom `children` render prop for the React `FeatureAppLoader`
  to render a custom loading and error UI when a Feature App is loading or can
  not be rendered
- how to define an `onError` prop for the React `FeatureAppLoader` to customize
  error handling (e.g. logging) for a Feature App that can not be rendered

```sh
yarn watch:demo react-loading-and-error-ui
```

### [TodoMVC](src/todomvc)

Demonstrates:

- how to compose the [TodoMVC][todomvc] application using three Feature Apps and
  a Feature Service

```sh
yarn watch:demo todomvc
```

### [DOM Integrator](src/integrator-dom)

Demonstrates:

- how the `@feature-hub/dom` package can be used to render DOM Feature Apps
  using Web Components

```sh
yarn watch:demo integrator-dom
```

### [Advanced Routing](src/advanced-routing)

Demonstrates:

- how the `@feature-hub/history-service` package and a custom navigation service
  can be utilized to push location changes from one Feature App to another

```sh
yarn watch:demo advanced-routing
```

---

Copyright (c) 2018-2021 SinnerSchrader Deutschland GmbH. Released under the
terms of the [MIT License][license].

[license]: https://github.com/sinnerschrader/feature-hub/blob/master/LICENSE
[website]: https://feature-hub.io/
[website-badge]:
  https://img.shields.io/badge/Website-feature--hub.io-%23500dc5.svg
[todomvc]: http://todomvc.com
[pino]: http://getpino.io
