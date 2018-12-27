---
id: writing-a-feature-app
title: Writing a Feature App
sidebar_label: Writing a Feature App
---

The default export of a Feature App module must be a definition object. It
consists of an `id`, an optional `dependencies` object, and the `create` method:

```js
export default {
  id: 'acme:my-feature-app',

  dependencies: {
    'acme:some-feature-service': '^2.0'
  },

  create(env) {
    // ...
  }
};
```

## Naming a Feature App

A Feature App definition must declare an `id`. It is recommended to use
namespaces for the Feature App ID to avoid naming conflicts, e.g.:

```js
const id = 'acme:my-feature-app';
```

This ID is used to look up the config for a Feature App. Furthermore, it is used
as a consumer ID for the [bindings][providing-consumer-specific-state] of the
Feature Services that a Feature App depends on.

If there is more than one instance of a Feature App on a single page, the
integrator must set a unique ID specifier for each Feature App with the same ID.
The `FeatureServiceRegistry` then uses the ID together with the ID specifier to
create a unique consumer ID.

## Depending on Feature Services

In `dependencies`, required Feature Services are declared with their ID and a
[semver][semver] version string:

```js
const dependencies = {
  'acme:some-feature-service': '^2.0'
};
```

## Instantiating a Feature App

The `create` method takes the single argument `env`, which has the following
properties:

1.  `config`: A Feature App config object that is
    [provided][providing-config-objects] by the integrator.
1.  `featureServices`: An object of required Feature Services that are
    [semver-compatible][semver] with the declared dependencies in the Feature
    App definition.
1.  `idSpecifier`: An optional ID specifier that distinguishes the Feature App
    instance from other Feature App instances with the same ID.

Assuming the `@feature-hub/react` package is used, a Feature App can be either a
"React Feature App" or a "DOM Feature App".

### Rendering a React Feature App

A React Feature App definition's `create` method returns a Feature App instance
with a `render` method that itself returns a `ReactNode`:

```js
export default {
  id,
  dependencies,

  create(env) {
    return {
      render: () => <div>Foo</div>
    };
  }
};
```

**Note:** Since this element is directly rendered by React, the standard React
lifecyle methods can be used (if `render` returns an instance of a React
component class).

### Rendering a DOM Feature App

A DOM Feature App definition's `create` method returns a Feature App instance
with an `attachTo` method that accepts a DOM container element:

```js
export default {
  id,
  dependencies,

  create(env) {
    return {
      attachTo(container) {
        container.innerText = 'Foo';
      }
    };
  }
};
```

## Registering Own Feature Services

A Feature App can also register its own Feature Services by declaring
`ownFeatureServiceDefinitions`, e.g.:

```js
import {myFeatureServiceDefinition} from './my-feature-service';
```

```js
export default {
  id: 'acme:my-feature-app',

  dependencies: {
    'acme:my-feature-service': '^1.0'
  },

  ownFeatureServiceDefinitions: [myFeatureServiceDefinition],

  create(env) {
    const myFeatureService = env.featureServices['acme:my-feature-service'];

    myFeatureService.init(42);

    return {
      render: () => <div>{myFeatureService.getSomeSharedState()}</div>
    };
  }
};
```

This allows teams to quickly get Feature Apps off the ground, without being
dependent on the integrator. However, as soon as other teams need to use this
Feature Service, it should be published and included in the global set of
Feature Services by the integrator.

## Dynamic Code Splitting With Webpack

Feature Apps can use webpack's [dynamic code splitting][dynamic-imports]
technique using the `import()` syntax.

To make this work for multiple Feature Apps living together on the Feature Hub
two settings need to be made:

1. Set a unique value for [`output.jsonpFunction`][output-jsonpfunction], e.g.
   `'webpackJsonpMyFeatureApp'`.

1. Set [`output.publicPath`][output-publicpath] to the public URL (relative or
   absolute) of the output directory, i.e. where all the Feature App chunks are
   hosted.

   Since this is not always known at compile time, it can be left blank and set
   dynamically at runtime in the Feature App's entry file using the global
   variable `__webpack_public_path__`:

   ```js
   export default {
     id: 'acme:my-feature-app',

     create(env) {
       __webpack_public_path__ = '/path/to/my-feature-app';

       // ...
     }
   };
   ```

[dynamic-imports]: https://webpack.js.org/guides/code-splitting/#dynamic-imports
[output-jsonpfunction]:
  https://webpack.js.org/configuration/output/#output-jsonpfunction
[output-publicpath]:
  https://webpack.js.org/configuration/output/#output-publicpath
[providing-config-objects]:
  /docs/guides/integrating-the-feature-hub#providing-config-objects
[providing-consumer-specific-state]:
  /docs/guides/writing-a-feature-service#providing-consumer-specific-state
[semver]: https://semver.org
