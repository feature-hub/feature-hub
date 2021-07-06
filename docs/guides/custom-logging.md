---
id: custom-logging
title: Custom Logging
sidebar_label: Custom Logging
---

> The feature described in this guide is also demonstrated in the ["Custom
> Logging" demo][custom-logging-demo].

By default, the Feature Hub uses the `console` for all log statements. This
behaviour can be customized by providing a custom logger.

In the following examples, [pino][] is used as a custom logger:

```js
import pino from 'pino';

const logger = pino();
```

## `@feature-hub/core`

To provide a custom logger to the `FeatureAppManager` and
`FeatureServiceRegistry`, the integrator can set the `logger` option of the
`createFeatureHub` function:

```js
import {createFeatureHub} from '@feature-hub/core';
```

```js
const {featureAppManager} = createFeatureHub('acme:integrator', {logger});
```

## `@feature-hub/react`

To provide a custom logger to the React `FeatureAppLoader` and React
`FeatureAppContainer`, the integrator can use the `FeatureHubContextProvider`:

```js
import {FeatureHubContextProvider} from '@feature-hub/react';
```

```jsx
<FeatureHubContextProvider value={{featureAppManager, logger}}>
  {/* render Feature Apps here */}
</FeatureHubContextProvider>
```

## `@feature-hub/dom`

To provide a custom logger to the `feature-app-loader` and
`feature-app-container` custom elements, the integrator can set the `logger`
option of the `defineFeatureAppContainer` and `defineFeatureAppLoader`
functions:

```js
import {
  defineFeatureAppContainer,
  defineFeatureAppLoader,
} from '@feature-hub/dom';
```

```js
defineFeatureAppContainer(featureAppManager, {logger});
defineFeatureAppLoader(featureAppManager, {logger});
```

## Feature Apps & Feature Services

To provide a custom logger to Feature Apps and Feature Services, the integrator
can provide the Logger Feature Service from the
[`@feature-hub/logger`][logger-api] package. It must be defined with a function
that takes the `consumerId` and optional `consumerName` of the consuming Feature
App or Feature Service, and returns a [`Logger`][core-logger-interface]
instance. This makes it possible to augment the consumer logs with the
`consumerId` and/or `consumerName`, e.g. using pino's child logger:

```js
import {defineLogger} from '@feature-hub/logger';
```

```js
const {featureAppManager} = createFeatureHub('acme:integrator', {
  logger,
  featureServiceDefinitions: [
    defineLogger((consumerId, consumerName) =>
      logger.child({consumerId, consumerName})
    ),
  ],
});
```

A Feature App could then use the Logger Feature Service like this:

```js
const myFeatureAppDefinition = {
  id: 'acme:my-feature-app',

  dependencies: {
    featureServices: {
      's2:logger': '^1.0.0',
    },
  },

  create(env) {
    const logger = env.featureServices['s2:logger'];

    logger.debug('foo');

    // ...
  },
};
```

Similarly, a Feature Service could use the Logger Feature Service like this:

```js
const myFeatureServiceDefinition = {
  id: 'acme:my-feature-service',

  dependencies: {
    featureServices: {
      's2:logger': '^1.0.0',
    },
  },

  create(env) {
    const logger = env.featureServices['s2:logger'];

    logger.debug('foo');

    // ...
  },
};
```

The [History Service][history-service-logger-dep] and the [Async SSR
Manager][async-ssr-manager-logger-dep] have the Logger Feature Service defined
as an optional dependency. If the integrator has provided the Logger Service,
they use it for their logging. Otherwise the `console` is used as a fallback.

[custom-logging-demo]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/custom-logging
[pino]: http://getpino.io
[logger-api]: /api/modules/logger.html
[core-logger-interface]: /api/interfaces/core.logger.html
[history-service-logger-dep]:
  /api/interfaces/history_service.historyservicedependencies.html#s2_logger
[async-ssr-manager-logger-dep]:
  /api/interfaces/async_ssr_manager.asyncssrmanagerdependencies.html#s2_logger
