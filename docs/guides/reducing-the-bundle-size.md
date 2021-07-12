---
id: reducing-the-bundle-size
title: Reducing the Bundle Size
sidebar_label: Reducing the Bundle Size
---

To minimize the amount of code shipped to the client, [common npm dependencies
can be shared][sharing-npm-dependencies] between Feature Apps and the
integrator. In addition, code can be dynamically loaded using dynamic code
splitting.

## Dynamic Code Splitting With Webpack

Client-side rendered Feature Apps can use [Webpack's dynamic code
splitting][dynamic-imports] technique using the `import()` syntax.

To make this work for multiple Feature Apps living together in one integrator,
two settings need to be made:

1.  - For Webpack 4: Set a unique value for
      [`output.jsonpFunction`][output-jsonpfunction], e.g.
      `'webpackJsonpMyFeatureApp'`.

    - For Webpack 5: Set a unique value for
      [`output.uniqueName`][output-uniquename], e.g. `'acme-my-feature-app'`.

1.  - If the Feature App is [bundled as a federated
      module][federated-feature-app], set
      [`output.publicPath`][output-publicpath] to `'auto'` (default).

    - If the Feature App is [bundled as an AMD module][amd-module], set
      [`output.publicPath`][output-publicpath] to the public URL (relative or
      absolute) of the output directory, i.e. where all the chunks are hosted.

      Since this is not always known at built time, it can be left blank and set
      dynamically at runtime in the entry file using the global variable
      `__webpack_public_path__`:

      ```js
      const myFeatureAppDefinition = {
        id: 'acme:my-feature-app',

        create(env) {
          __webpack_public_path__ = env.baseUrl;

          // ...
        },
      };
      ```

> **Note:**  
> A solution for server-side rendered Feature Apps that want to use code
> splitting has not yet been worked out.

[dynamic-imports]: https://webpack.js.org/guides/code-splitting/#dynamic-imports
[output-jsonpfunction]:
  https://v4.webpack.js.org/configuration/output/#outputjsonpfunction
[output-uniquename]:
  https://webpack.js.org/configuration/output/#outputuniquename
[output-publicpath]:
  https://webpack.js.org/configuration/output/#outputpublicpath
[sharing-npm-dependencies]: /docs/guides/sharing-npm-dependencies
[federated-feature-app]:
  /docs/guides/writing-a-feature-app#webpack-module-federation-loader
[amd-module]: /docs/guides/writing-a-feature-app#amd-module-loader
