---
id: reducing-the-bundle-size
title: Reducing the Bundle Size
sidebar_label: Reducing the Bundle Size
---

To minimize the amount of code shipped to the client, [common npm dependencies
can be shared][sharing-npm-dependencies] between Feature Apps and the
integrator. In addition, code can be dynamically loaded using dynamic code
splitting.

Although it is generally possible to integrate Feature Apps built using
different frontend technologies (e.g. Vue.js, Angular, Web Components), this is
not recommended because it increases the bundle size significantly.

## Dynamic Code Splitting With Webpack

Feature Apps and Feature Services can use [webpack's dynamic code
splitting][dynamic-imports] technique using the `import()` syntax.

To make this work for multiple inhabitants living together on the Feature Hub
two settings need to be made:

1. Set a unique value for [`output.jsonpFunction`][output-jsonpfunction], e.g.
   `'webpackJsonpMyFeatureApp'`.

1. Set [`output.publicPath`][output-publicpath] to the public URL (relative or
   absolute) of the output directory, i.e. where all the chunks are hosted.

   Since this is not always known at compile time, it can be left blank and set
   dynamically at runtime in the entry file using the global variable
   `__webpack_public_path__`:

   ```js
   const myFeatureAppDefinition = {
     id: 'acme:my-feature-app',

     create(env) {
       __webpack_public_path__ = '/path/to/my-feature-app';

       // ...
     }
   };
   ```

   ```js
   const myFeatureServiceDefinition = {
     id: 'acme:my-feature-service',

     create(env) {
       __webpack_public_path__ = '/path/to/my-feature-service';

       // ...
     }
   };
   ```

[dynamic-imports]: https://webpack.js.org/guides/code-splitting/#dynamic-imports
[output-jsonpfunction]:
  https://webpack.js.org/configuration/output/#output-jsonpfunction
[output-publicpath]:
  https://webpack.js.org/configuration/output/#output-publicpath
[sharing-npm-dependencies]: /docs/guides/sharing-npm-dependencies
