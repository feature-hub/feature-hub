---
id: sharing-the-browser-history
title: Sharing the Browser History
sidebar_label: Sharing the Browser History
---

> The feature described in this guide is also demonstrated in the ["History
> Service" demo][history-service-demo].

When multiple Feature Apps coexist on the same page, they shouldn't access the
[browser history API][browser-history-api] directly. Otherwise, they would
potentially overwrite their respective history and location changes. To enable
safe access to the history for multiple consumers, the
[`@feature-hub/history-service`][history-service-api] package can be used.

## Functional Behaviour

The **History Service** combines multiple consumer histories (and their
locations) into a single one. It does this by merging all registered consumer
locations into one, and persisting this combined root location on the history
stack. As long as the consumer performs all history and location interactions
through the history it obtained from the History Service, the existence of the
facade and other consumers isn't noticeable for the consumer. For example, the
consumer receives history change events only for location changes that affect
its own history.

How the root location is build from the consumer locations, is a problem that
can not be solved generally, since it is dependent on the usecase. This is why
the integrator defines the History Service with a so-called **root location
transformer**. The root location transformer provides functions for merging
consumer locations into a root location, and for extracting a consumer path from
the root location.

For a quick out-of-the-box experience, this package also provides a root
location transformer (via the `createRootLocationTransformer` method) ready for
use. This included root location transformer has the concept of a primary
consumer. Only the primary's location (pathname and query) will get inserted
directly into the root location. All other consumer locations are encoded into a
JSON string which will be assigned to a single configurable query parameter.

## Usage

### As a Feature App

```js
import {unstable_HistoryRouter as HistoryRouter} from 'react-router-dom';
```

```js
const myFeatureAppDefinition = {
  id: 'acme:my-feature-app',

  dependencies: {
    featureServices: {
      's2:history': '^3.0.0',
    },
  },

  create(env) {
    const historyService = env.featureServices['s2:history'];

    return {
      render: () => (
        <HistoryRouter history={historyService.history}>
          <App />
        </HistoryRouter>
      ),
    };
  },
};
```

The `history` property of the History Service is API-compatible with the history
package. Note, however, that the `go`, `back`, `forward` and `block` methods are
not supported. For further information, reference its
[documentation][history-npm].

### As the Integrator

The integrator defines the History Service using a root location transformer and
registers it at the Feature Service registry.

On the client:

```js
import {createFeatureHub} from '@feature-hub/core';
import {
  createRootLocationTransformer,
  defineHistoryService,
} from '@feature-hub/history-service';
```

```js
const rootLocationTransformer = createRootLocationTransformer({
  consumerPathsQueryParamName: '---',
});

const featureHub = createFeatureHub('acme:integrator', {
  featureServiceDefinitions: [defineHistoryService(rootLocationTransformer)],
});
```

On the server, the History Service needs the server request to compute the
initial history location of the static history. The integrator therefore defines
the server request Feature Service, and sets the `mode` of the History Service
to `'static'`:

```js
import {createFeatureHub} from '@feature-hub/core';
import {
  createRootLocationTransformer,
  defineHistoryService,
} from '@feature-hub/history-service';
import {defineServerRequest} from '@feature-hub/server-request';
```

```js
const rootLocationTransformer = createRootLocationTransformer({
  consumerPathsQueryParamName: '---',
});

const request = {
  // ... obtain the request from somewhere, e.g. a request handler
};

const featureHub = createFeatureHub('acme:integrator', {
  featureServiceDefinitions: [
    defineServerRequest(request),
    defineHistoryService(rootLocationTransformer, {mode: 'static'}),
  ],
});
```

## Root Location Transformer

A root location transformer is an object that implements the
`RootLocationTransformer` interface of the
[`@feature-hub/history-service`][history-service-api] package. It provides two
functions, `getConsumerPathFromRootLocation` and `createRootLocation`. In the
following example, each consumer location is encoded as its own query parameter,
with the `historyKey` used as parameter name:

```js
import * as history from 'history';
```

```js
const rootLocationTransformer = {
  getConsumerPathFromRootLocation(rootLocation, historyKey) {
    const searchParams = new URLSearchParams(rootLocation.search);

    return searchParams.get(historyKey);
  },

  createRootLocation(currentRootLocation, consumerLocation, historyKey) {
    const searchParams = new URLSearchParams(currentRootLocation.search);
    searchParams.set(historyKey, history.createPath(consumerLocation));

    return {...currentRootLocation, search: searchParams.toString()};
  },
};
```

## Demo

There is a demo that simulates the capabilities of the History Service with two
Feature Apps. Go to the monorepo top-level directory and install all
dependencies:

```sh
yarn
```

Now run the demo:

```sh
yarn watch:demo history-service
```

## Caveats

### Replace and Pop

Since multiple consumers can push and replace locations at any time onto the
browser history stack, special attention must be given when **replacing**
consumer locations. Imagine the following scenario with two History Service
consumers (A and B):

- A and B are initially loaded with `/`.

  | Browser History Stack | Current URL |
  | --------------------- | ----------- |
  | /?a=**/**&b=**/**     | ⬅️          |

* A pushes `/a1`, e.g. caused by user interaction.

  | Browser History Stack | Current URL |
  | --------------------- | ----------- |
  | /?a=/&b=/             |             |
  | /?a=**/a1**&b=/       | ⬅️          |

* B decides it needs to replace `/` with `/b1`, e.g. because it received some
  outdated data.

  | Browser History Stack | Current URL |
  | --------------------- | ----------- |
  | /?a=/&b=/             |             |
  | /?a=/a1&b=**/b1**     | ⬅️          |

* The user navigates back.

  | Browser History Stack | Current URL |
  | --------------------- | ----------- |
  | /?a=/&b=/             | ⬅️          |
  | /?a=/a1&b=/b1         |             |

* ⚠️ Now it is B's responsibility, again, to replace its location with `/b1` on
  the first browser history entry.

  | Browser History Stack | Current URL |
  | --------------------- | ----------- |
  | /?a=/&b=**/b1**       | ⬅️          |
  | /?a=/a1&b=/b1         |             |

> **Note:**  
>  The alternating background colors of the table rows don't have any meaning.

### Push, Push, and Pop

When a History Service consumer pushes the same location multiple times in a row
and the user subsequently navigates back, no pop event is emitted for the
unchanged location of this consumer.

## Changing multiple consumers at once with a single navigation

To trigger a navigation from a Feature App to another page that composes a
different set of Feature Apps, a navigation Feature Service that encapsulates
integrator routing logic would be needed.

Such a Feature Service would have the need to collect consumer locations from
other consumers (and itself), and then push a single root location that combines
these consumer locations to the root history.

To accomplish that, the History Service exposes the following additional
properties:

- `historyKey`: The history key that has been assigned to the consumer.
- `createNewRootLocationForMultipleConsumers`: A method that creates a new root
  location from multiple so-called consumer locations. A consumer location
  consists of the actual `location` and the `historyKey` of the consumer.
- `rootHistory`: Offers `push`, `replace`, and `createHref` methods that all
  accept a new root location that was created using the
  `createNewRootLocationForMultipleConsumers` method.

> For more details see the ["Advanced Routing" demo][advanced-routing-demo].

[browser-history-api]: https://developer.mozilla.org/en-US/docs/Web/API/History
[history-npm]: https://www.npmjs.com/package/history
[history-service-api]: /api/modules/history_service.html
[history-service-demo]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/history-service
[advanced-routing-demo]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/advanced-routing
