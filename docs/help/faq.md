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

## Does the Feature Hub run in Internet Explorer 11?

TLDR: Yes, with polyfills.

The Feature Hub's source code uses ES2017 language features, but is transpiled
down to ES5. Still, an integrator that wants to support IE11 must provide
polyfills for some of those newer language features. There are at least two
possibilities to accomplish this:

1. A service like [Polyfill.io][] can be integrated to polyfill all features of
   ES2015, ES2016, and ES2017, but only if the user's browser does not implement
   them, e.g. by adding the following script before the integrator bundle:

   ```html
   <script
     crossorigin="anonymous"
     src="https://polyfill.io/v3/polyfill.min.js?features=es2015%2Ces2016%2Ces2017"
   ></script>
   ```

1. The Feature Hub also provides its own polyfills at
   `@feature-hub/core/lib/polyfills.js`. They are built with [ts-polyfill][],
   and are approximately 50% smaller than the polyfills sent to IE11 users by
   [Polyfill.io][].

> **Note:**  
> It is also possible that the integrator already provides these polyfills for
> other reasons, e.g. via [@babel/polyfill][babel-polyfill] or [core-js][].
> Therefore, make sure to not serve or bundle polyfills multiple times.

[angular-feature-app]: https://github.com/feature-hub/angular-feature-app
[dom-api]: /@feature-hub/modules/dom.html
[dom-feature-app]: /docs/guides/writing-a-feature-app#dom-feature-app
[dynamic-code-splitting]:
  /docs/guides/reducing-the-bundle-size#dynamic-code-splitting-with-webpack
[own-feature-service-definitions]:
  /docs/guides/writing-a-feature-app#ownfeatureservicedefinitions
[react-api]: /@feature-hub/modules/react.html
[writing-a-feature-app]: /docs/guides/writing-a-feature-app
[vue-feature-app]: https://github.com/feature-hub/vue-feature-app
[feature-app-in-feature-app]: /docs/guides/feature-app-in-feature-app
[polyfill.io]: https://polyfill.io/v3/
[ts-polyfill]: https://www.npmjs.com/package/ts-polyfill
[babel-polyfill]: https://babeljs.io/docs/en/babel-polyfill
[core-js]: https://github.com/zloirock/core-js
