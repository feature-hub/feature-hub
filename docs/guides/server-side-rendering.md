---
id: server-side-rendering
title: Server-Side Rendering
sidebar_label: Server-Side Rendering
---

> The features described in this guide are also demonstrated in the
> ["Server-Side Rendering" demo][server-side-rendering-demo].

## State Serialization

When rendering on the server, there usually is the need to hydrate the
server-rendered website on the client using the same state as on the server. To
help with that, the
[`@feature-hub/serialized-state-manager`][serialized-state-manager-api] package
provides the **Serialized State Manager** Feature Service that enables
consumers, i.e. Feature Apps and Feature Services, to store their serialized
state on the server, and retrieve it again on the client during hydration.

### As a Consumer

Using the Serialized State Manager as a dependency, a consumer (in this case a
Feature Service) could serialize its state like this:

```js
const myFeatureServiceDefinition = {
  id: 'acme:my-feature-service',

  dependencies: {
    featureServices: {
      's2:serialized-state-manager': '^1.0.0',
    },
  },

  create(env) {
    let count = 0;

    const serializedStateManager =
      env.featureServices['s2:serialized-state-manager'];

    if (typeof window === 'undefined') {
      // on the server
      serializedStateManager.register(() => JSON.stringify({count}));
    } else {
      // on the client
      count = JSON.parse(serializedStateManager.getSerializedState()).count;
    }

    return {
      '1.0.0': () => ({
        featureService: {
          // We assume the setCount method is called by consumers while they are
          // rendered on the server.
          setCount(newCount) {
            count = newCount;
          },

          getCount() {
            return count;
          },
        },
      }),
    };
  },
};
```

On the server, Feature Apps and Feature Services register a callback that
serializes their state with the `register` method. This callback is called after
server-side rendering is completed. On the client, they retrieve their
serialized state again with `getSerializedState`, and deserialize it.

In the example above, `JSON.stringify` is used for serialization, and
`JSON.parse` is used for deserialization.

### As the Integrator

The integrator has the responsibility to transfer all serialized consumer states
from the server to the client.

On the server, the Serialized State Manager provides a `serializeStates` method,
that serializes all consumer states. After server-side rendering is completed,
[the integrator must obtain the Feature Service][consuming-feature-services] and
call this method:

```js
const serializedStates = serializedStateManager.serializeStates();
```

The `serializedStates` string is encoded so that it can be safely injected into
the HTML document, e.g. [as text content of a custom script
element][demos-inject-serialized-states-script].

On the client, before hydrating, this string must be extracted from the HTML
document, e.g. [from the text content of the custom script
element][demos-extract-serialized-states-script], and passed unmodified into the
`defineSerializedStateManager` function, where it will be decoded again:

```js
defineSerializedStateManager(serializedStates);
```

Now the hydration can be started, and consumers will be able to
[retrieve their serialized state from the Serialized State Manager](#as-a-consumer).

## Preloading Feature Apps on the Client

Before hydrating server-rendered Feature Apps, their source code for the client
must be preloaded, so that on the client the same UI is rendered as on the
server.

On the server, the integrator must gather a list of all client module bundle
URLs for the server-rendered Feature Apps, and transfer those URLs to the
client, e.g. via the HTML document [as text content of a custom script
element][demos-inject-hydration-urls-script].

On the client, before hydrating, the URLs must be extracted from the HTML
document, e.g. [from the text content of the custom script
element][demos-extract-hydration-urls-script], and then preloaded using the
`FeatureAppManager`'s `preloadFeatureApp` method:

```js
const urlsForHydration = getUrlsForHydrationFromDom();

await Promise.all(
  urlsForHydration.map(async (url) => featureAppManager.preloadFeatureApp(url))
);
```

### Using React

On the server, a React integrator can use the `FeatureHubContextProvider` to
provide a callback that is called by the `FeatureAppLoader` for server-rendered
Feature Apps to populate a set of URLs for hydration on the client:

```js
const urlsForHydration = new Set();
const addUrlForHydration = (url) => urlsForHydration.add(url);
```

```jsx
<FeatureHubContextProvider value={{featureAppManager, addUrlForHydration}}>
  {/* render Feature Apps here */}
</FeatureHubContextProvider>
```

### Handling Module Types

If, on the client, the integrator has provided [a module loader that handles
multiple module types][custom-module-loader], the module type of a Feature App's
client module bundle must be used when preloading the Feature App.

On the server:

```js
const hydrationSources = new Map();

const addUrlForHydration = (url, moduleType) =>
  hydrationSources.set(url + moduleType, {url, moduleType});
```

On the client:

```js
const hydrationSources = getHydrationSourcesFromDom();

await Promise.all(
  hydrationSources.map(async ({url, moduleType}) =>
    featureAppManager.preloadFeatureApp(url, moduleType)
  )
);
```

## Adding Stylesheets to the Document

When a Feature App has been rendered on the server, and there are [external
stylesheets defined for this Feature App][feature-app-loader-css], those
stylesheets should be added to the document head, before sending the HTML to the
client. This allows the browser to render the Feature App HTML with the
corresponding styles before all the scripts have been loaded and the
server-rendered page has been hydrated.

### Using React

On the server, a React integrator can use the `FeatureHubContextProvider` to
provide a callback that is called by the `FeatureAppLoader` for server-rendered
Feature Apps to populate a collection of stylesheets that should be added to the
document head:

```js
const stylesheetsForSsr = new Map();

const addStylesheetsForSsr = (stylesheets) => {
  for (const stylesheet of stylesheets) {
    stylesheetsForSsr.set(stylesheet.href, stylesheet);
  }
};
```

```jsx
<FeatureHubContextProvider value={{featureAppManager, addStylesheetsForSsr}}>
  {/* render Feature Apps here */}
</FeatureHubContextProvider>
```

## Asynchronous Server-Side Rendering Using React

Since React does not yet support asynchronous rendering on the server, the
[`@feature-hub/async-ssr-manager`][async-ssr-manager-api] package provides the
**Async SSR Manager** Feature Service that enables the integrator to render any
given composition of React Feature Apps in multiple render passes until all
Feature Apps and Feature Services have finished their asynchronous operations.

### As a Feature App

A Feature App that, for example, needs to fetch data asynchronously when it is
initially rendered, must define the Async SSR Manager as an optional dependency
in its Feature App definition.

> **Note:**  
> The dependency must be optional, since the integrator provides the Feature
> Service only on the server. The Feature App can determine from its presence
> whether it is currently rendered on the server or on the client.

On the server, the Feature App can use the `scheduleRerender` method to tell the
Async SSR Manager that another render pass is required after the data has been
loaded:

```js
const myFeatureAppDefinition = {
  id: 'acme:my-feature-app',

  optionalDependencies: {
    featureServices: {
      's2:async-ssr-manager': '^1.0.0',
    },
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
      asyncSsrManager.scheduleRerender(dataPromise);
    }

    return {
      render() {
        return <div>{data}</div>;
      },
    };
  },
};
```

> **Note:**  
> The `scheduleRerender` method must be called synchronously during a render
> pass, or while already scheduled asynchronous operations are running. For more
> information see the [API docs][async-ssr-manager-api-schedule-rerender].

> **Note:**  
> In more complex Feature Apps, it may be more difficult to determine the right
> point in time where all asynchronous operations have been completed. However,
> this is a problem that needs to be solved anyway when such web applications
> need to be rendered on the server. It is not a special requirement of the
> Feature Hub.

### As a Feature Service

If a Feature Service consumer changes shared state of a Feature Service during a
render pass on the server, the Feature Service should schedule a rerender to
give its consumers a chance to update themselves based on the state change:

```js
const myFeatureServiceDefinition = {
  id: 'acme:my-feature-service',

  optionalDependencies: {
    featureServices: {
      's2:async-ssr-manager': '^1.0.0',
    },
  },

  create(env) {
    let count = 0;

    const asyncSsrManager = env.featureServices['s2:async-ssr-manager'];

    return {
      '1.0.0': () => ({
        featureService: {
          // We assume the setCount method is called by consumers while they are
          // rendered on the server.
          setCount(newCount) {
            count = newCount;

            if (asyncSsrManager) {
              asyncSsrManager.scheduleRerender();
            }
          },

          getCount() {
            return count;
          },
        },
      }),
    };
  },
};
```

### As the Integrator

The Async SSR Manager provides a `renderUntilCompleted` method, that resolves
with an HTML string when all consumers have completed their asynchronous
operations.

On the server, [the integrator must first obtain the Feature
Service][consuming-feature-services]. Together with the `FeatureAppManager` and
the React `FeatureAppLoader` (or `FeatureAppContainer`), the integrator can then
render React Feature Apps that depend on asynchronous operations to fully render
their initial view:

```js
const html = await asyncSsrManager.renderUntilCompleted(() =>
  ReactDOM.renderToString(
    <FeatureHubContextProvider value={{featureAppManager, asyncSsrManager}}>
      <FeatureAppLoader
        src="https://example.com/some-feature-app.js"
        serverSrc="https://example.com/some-feature-app-node.js"
      />
    </FeatureHubContextProvider>
  )
);
```

> **Note:**  
> The client-side integrator code should not register the Async SSR Manager, so
> that consumers can determine from its presence whether they are currently
> rendered on the server or on the client.

[async-ssr-manager-api]: /api/modules/async_ssr_manager.html
[async-ssr-manager-api-schedule-rerender]:
  /api/interfaces/async_ssr_manager.asyncssrmanagerv1.html#schedulererender
[serialized-state-manager-api]: /api/modules/serialized_state_manager.html
[demos-inject-serialized-states-script]:
  https://github.com/sinnerschrader/feature-hub/blob/093b6273b903477f2ab0aaccb4e0502e0dae79dc/packages/demos/src/start-server.js#L39
[demos-extract-serialized-states-script]:
  https://github.com/sinnerschrader/feature-hub/blob/093b6273b903477f2ab0aaccb4e0502e0dae79dc/packages/demos/src/server-side-rendering/integrator.tsx#L14-L20
[demos-inject-hydration-urls-script]:
  https://github.com/sinnerschrader/feature-hub/blob/093b6273b903477f2ab0aaccb4e0502e0dae79dc/packages/demos/src/start-server.js#L44-L46
[demos-extract-hydration-urls-script]:
  https://github.com/sinnerschrader/feature-hub/blob/093b6273b903477f2ab0aaccb4e0502e0dae79dc/packages/demos/src/server-side-rendering/integrator.tsx#L22-L32
[consuming-feature-services]:
  /docs/guides/integrating-the-feature-hub#consuming-feature-services
[server-side-rendering-demo]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/server-side-rendering
[feature-app-loader-css]: /docs/guides/integrating-the-feature-hub#css
[custom-module-loader]:
  /docs/guides/integrating-the-feature-hub#custom-module-loader
