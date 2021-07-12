---
id: faq
title: FAQ
sidebar_label: FAQ
---

## Can the integrator register Feature Services one by one?

Yes, but then you need to guarantee the correct order. On the other hand, all
Feature Services registered **together** using the `registerFeatureServices`
method of the `FeatureServiceRegistry` are automatically sorted topologically
and therefore do not need to be registered in the correct order.

## Can Feature Services be dynamically loaded after initial load?

Yes, a Feature App that is loaded dynamically can [register its own Feature
Services][own-feature-service-definitions]. The disadvantage of this solution is
that several Feature Apps may bring the same Feature Services and therefore
unnecessary code is loaded. In addition, version conflicts may occur.

Alternatively, a Feature Service could be implemented using [dynamic code
splitting][dynamic-code-splitting]. The relevant code components would only be
dynamically loaded when the Feature Service is used.

## Can a Feature App render another Feature App?

Yes, [a React Feature App can render another Feature
App][feature-app-in-feature-app].

## Can we integrate an existing Angular 2.0 application into the Feature Hub?

Yes, but the application must first be [converted to a Feature
App][writing-a-feature-app]. The [`@feature-hub/dom`][dom-api] or the
[`@feature-hub/react`][react-api] package can be used to integrate the
application as a DOM Feature App. There is a [demo][angular-feature-app] that
shows the integration of an Angular application into a `@feature-hub/dom`
integrator.

## Is it possible to build Feature Apps using Vue.js?

Yes, it is possible to use Vue.js to build Feature Apps. A Vue.js Feature App
would implement the DOM Feature App interface and therefore be integratable in
an integrator using [`@feature-hub/dom`][dom-api] as well as
[`@feature-hub/react`][react-api]. There is a [demo][vue-feature-app] that shows
the integration of a Vue.js application into a `@feature-hub/dom` integrator.

## Does the Feature Hub run in Internet Explorer 11 (IE11)?

The Feature Hub's published source code includes ES2017 language features.
Therefore, only evergreen browsers (and Node >= 8) are supported out-of-the-box.

An integrator could still choose to support IE11 though, by transpiling the
published sources to ES5 while creating its bundle. For example, if Webpack is
used, the [babel-loader][] can be configured with an `exclude` option like this:

```js
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /node_modules\/(?!@feature-hub)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
        },
      },
    },
  ];
}
```

Furthermore, polyfills for ES2015, ES2016, and ES2017 must be provided, e.g. by
integrating a service like [Polyfill.io][]:

```html
<script
  crossorigin="anonymous"
  src="https://polyfill.io/v3/polyfill.min.js?features=es2015%2Ces2016%2Ces2017"
></script>
```

If the integrator wants to load Feature Apps that are [bundled as federated
modules][module-federation-loader], it must provide a [polyfill for
`document.currentScript`][current-script-polyfill] to enable [Webpack's
automatic public path detection][public-path-detection].

[angular-feature-app]: https://github.com/feature-hub/angular-feature-app
[dom-api]: /api/modules/dom.html
[dom-feature-app]: /docs/guides/writing-a-feature-app#dom-feature-app
[dynamic-code-splitting]:
  /docs/guides/reducing-the-bundle-size#dynamic-code-splitting-with-webpack
[own-feature-service-definitions]:
  /docs/guides/writing-a-feature-app#ownfeatureservicedefinitions
[react-api]: /api/modules/react.html
[writing-a-feature-app]: /docs/guides/writing-a-feature-app
[vue-feature-app]: https://github.com/feature-hub/vue-feature-app
[feature-app-in-feature-app]: /docs/guides/feature-app-in-feature-app
[polyfill.io]: https://polyfill.io/v3/
[babel-loader]: https://github.com/babel/babel-loader
[module-federation-loader]:
  /docs/guides/integrating-the-feature-hub#webpack-module-federation-loader
[public-path-detection]:
  https://webpack.js.org/guides/public-path/#automatic-publicpath
[current-script-polyfill]: https://github.com/amiller-gh/currentScript-polyfill
