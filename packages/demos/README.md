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
  Feature Apps that are deployed as AMD bundles can be loaded on the client

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

- how the Async SSR Manager can be used to manage aysnchronous server-side
  rendering with React
- how the Serialized State Manager can be used to transfer the state of
  server-rendered Feature Apps to the client
- how server-rendered Feature Apps can be preloaded in the client before
  hydration

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

### [TodoMVC](src/todomvc)

Demonstrates:

- how to compose the [TodoMVC][todomvc] application using three Feature Apps and
  a Feature Service

```sh
yarn watch:demo todomvc
```

---

Copyright (c) 2018-2019 SinnerSchrader Deutschland GmbH. Released under the
terms of the [MIT License][license].

[license]: https://github.com/sinnerschrader/feature-hub/blob/master/LICENSE
[website]: https://feature-hub.io/
[website-badge]:
  https://img.shields.io/badge/Website-feature--hub.io-%23500dc5.svg
[todomvc]: http://todomvc.com
[pino]: http://getpino.io
