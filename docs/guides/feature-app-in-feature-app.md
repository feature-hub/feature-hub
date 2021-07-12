---
id: feature-app-in-feature-app
title: Feature App in Feature App
sidebar_label: Feature App in Feature App
---

> The feature described in this guide is also demonstrated in the ["Feature App
> in Feature App" demo][feature-app-in-feature-demo].

It is possible that a [React Feature App][react-feature-app] renders another
Feature App within itself. To do that, the parent Feature App can either [use
the `FeatureAppContainer`][react-feature-app-container] to render another
Feature App that is included in its bundle, or the parent Feature App can [use
the `FeatureAppLoader`][react-feature-app-loader] to load and render a Feature
App that is deployed independently.

The parent Feature App must define a `featureAppId` for its child Feature App.
To avoid conflicts when multiple instances of this child Feature App are placed
on a single web page, the child `featureAppId` can be created using the parent's
`featureAppId` as prefix. For more details see the ["Feature App in Feature App"
demo][feature-app-in-feature-demo-outer].

The `FeatureAppContainer` and `FeatureAppLoader` both access the
`FeatureAppManager` singleton instance through React context that [the
integrator provides with the
`FeatureHubContextProvider`][placing-feature-apps-on-a-web-page-using-react]
from the [`@feature-hub/react`][react-api] package. Therefore the parent Feature
App must define `@feature-hub/react` and `react` as [external
dependencies][sharing-npm-dependencies]. In a Webpack config, this needs to be
added:

```json
{
  "externals": {
    "@feature-hub/react": "@feature-hub/react",
    "react": "react"
  }
}
```

And the integrator must provide `@feature-hub/react` and `react` as shared
dependencies.

On the client:

```js
import {createFeatureHub} from '@feature-hub/core';
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import * as FeatureHubReact from '@feature-hub/react';
import * as React from 'react';
```

```js
defineExternals({
  react: React,
  '@feature-hub/react': FeatureHubReact,
});

const {featureAppManager} = createFeatureHub('acme:integrator', {
  moduleLoader: loadAmdModule,
});
```

On the server:

```js
import {createFeatureHub} from '@feature-hub/core';
import {createCommonJsModuleLoader} from '@feature-hub/module-loader-commonjs';
import * as FeatureHubReact from '@feature-hub/react';
import * as React from 'react';
```

```js
const {featureAppManager} = createFeatureHub('acme:integrator', {
  moduleLoader: createCommonJsModuleLoader({
    react: React,
    '@feature-hub/react': FeatureHubReact,
  }),
});
```

[react-feature-app-container]:
  /docs/guides/integrating-the-feature-hub#react-feature-app-container
[placing-feature-apps-on-a-web-page-using-react]:
  /docs/guides/integrating-the-feature-hub#placing-feature-apps-on-a-web-page-using-react
[react-feature-app-loader]:
  /docs/guides/integrating-the-feature-hub#react-feature-app-loader
[react-feature-app]: /docs/guides/writing-a-feature-app#react-feature-app
[react-api]: /api/modules/react.html
[sharing-npm-dependencies]: /docs/guides/sharing-npm-dependencies
[feature-app-in-feature-demo]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/feature-app-in-feature-app
[feature-app-in-feature-demo-outer]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/feature-app-in-feature-app/feature-app-outer.tsx
