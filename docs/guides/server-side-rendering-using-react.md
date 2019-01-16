---
id: server-side-rendering-using-react
title: Server-Side Rendering Using React
sidebar_label: Server-Side Rendering Using React
---

Since React does not yet support asynchronous rendering on the server, the
`@feature-hub/async-ssr-manager` package provides an Async SSR Manager Feature
Service that enables the integrator to render any given composition of React
Feature Apps in multiple render passes until all Feature Apps and Feature
Services have finished their asynchronous operations.

## Usage

### As Integrator

On the server, the integrator needs to retrieve a bound Async SSR Manager:

```js
import {asyncSsrManagerDefinition} from '@feature-hub/async-ssr-manager';
import {FeatureAppManager, FeatureServiceRegistry} from '@feature-hub/core';
import {loadCommonJsModule} from '@feature-hub/module-loader-commonjs';
import {FeatureAppLoader} from '@feature-hub/react';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
```

```js
const featureServiceRegistry = new FeatureServiceRegistry();

const integratorDefinition = {
  id: 'acme:integrator',
  dependencies: {
    [asyncSsrManagerDefinition.id]: '^0.1'
  }
};

featureServiceRegistry.registerFeatureServices(
  [asyncSsrManagerDefinition],
  integratorDefinition.id
);

const {featureServices} = featureServiceRegistry.bindFeatureServices(
  integratorDefinition
);

const asyncSsrManager = featureServices[asyncSsrManagerDefinition.id];
```

> The client-side integrator code should not register the Async SSR Manager, so
> that consumers can determine from its presence whether they are currently
> rendered on the server or on the client.

Together with the Feature App manager and the React Feature App loader, the
integrator can then render React Feature Apps that depend on asynchronous
operations to fully render their initial view:

```js
const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
  moduleLoader: loadCommonJsModule
});

const html = await asyncSsrManager.renderUntilCompleted(() =>
  ReactDOM.renderToString(
    <FeatureAppLoader
      asyncSsrManager={asyncSsrManager}
      featureAppManager={featureAppManager}
      src="https://example.com/some-feature-app.js"
      serverSrc="https://example.com/some-feature-app-node.js"
    />
  )
);
```

### As Feature App

A Feature App that, for example, needs to fetch data asynchronously when it is
initially rendered, must define the Async SSR Manager as an optional dependency
in its Feature App definition. It uses the `rerenderAfter` method to tell the
Async SSR Manager that another render pass is required after the data has been
loaded.

```js
const myFeatureAppDefinition = {
  id: 'acme:my-feature-app',

  optionalDependencies: {
    's2:async-ssr-manager': '^0.1'
  },

  create(env) {
    let data = 'Loading...';

    const fetchData = async () => {
      try {
        const response = await fetch('https://example.com/foo');
        data = await response.text();
      } catch (error) {
        data = error.message;
      }
    };

    const dataPromise = fetchData();
    const asyncSsrManager = env.featureServices['s2:async-ssr-manager'];

    if (asyncSsrManager) {
      asyncSsrManager.rerenderAfter(dataPromise);
    }

    return {
      render() {
        return <div>{data}</div>;
      }
    };
  }
};
```

> The `rerenderAfter` method must be called synchronously during a render pass,
> since the Async SSR Manager synchronously checks after every render pass
> whether there are rerender promises it needs to await, and then do another
> render pass.

### As Feature Service

If a Feature Service consumer changes shared state of a Feature Service during a
render pass on the server, the Feature Service should trigger a rerender to give
its consumers a chance to update themselves based on the state change.

```js
const myFeatureServiceDefinition = {
  id: 'acme:my-feature-service',

  optionalDependencies: {
    's2:async-ssr-manager': '^0.1'
  },

  create(env) {
    const count = 0;
    const asyncSsrManager = env.featureServices['s2:async-ssr-manager'];

    return {
      '1.0': () => ({
        featureService: {
          setCount(newCount) {
            count = newCount;

            if (asyncSsrManager) {
              asyncSsrManager.rerenderAfter(Promise.resolve());
            }
          },

          getCount() {
            return count;
          }
        }
      })
    };
  }
};
```
