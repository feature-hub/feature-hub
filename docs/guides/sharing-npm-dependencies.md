---
id: sharing-npm-dependencies
title: Sharing NPM Dependencies
sidebar_label: Sharing NPM Dependencies
---

When using the AMD module loader, the integrator can provide shared npm
dependencies to Feature Apps using the `defineExternals` function:

```js
import {defineExternals, loadAmdModule} from '@feature-hub/module-loader-amd';
import * as React from 'react';
import Loadable from 'react-loadable';
```

```js
defineExternals({react: React, 'react-loadable': Loadable});

const manager = new FeatureAppManager(registry, {moduleLoader: loadAmdModule});
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
