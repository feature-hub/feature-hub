---
id: sharing-npm-dependencies
title: Sharing NPM Dependencies
sidebar_label: Sharing NPM Dependencies
---

> The feature described in this guide is also demonstrated in the ["AMD Module
> Loader" demo][amd-module-loader-demo].

When using the [`@feature-hub/module-loader-amd`][module-loader-amd-api]
package, the integrator can provide shared npm dependencies to Feature Apps
using the `defineExternals` function:

```js
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import * as React from 'react';
import Loadable from 'react-loadable';
```

```js
defineExternals({react: React, 'react-loadable': Loadable});

const featureAppManager = new FeatureAppManager(featureServiceRegistry, {
  moduleLoader: loadAmdModule
});
```

Feature Apps should define these externals in their build config. For example,
defining `react` as external in a webpack config would look like this:

```json
{
  "externals": {
    "react": "react"
  }
}
```

[module-loader-amd-api]: /@feature-hub/module-loader-amd/
[amd-module-loader-demo]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos/src/module-loader-amd
