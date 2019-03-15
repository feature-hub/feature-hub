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
application as a DOM Feature App. We have created a [demo][angular-feature-app]
that shows the integration of an Angular application into an `@feature-hub/dom`
integrator.

[angular-feature-app]: https://github.com/feature-hub/angular-feature-app
[dom-api]: /@feature-hub/dom/
[dom-feature-app]: /docs/guides/writing-a-feature-app#dom-feature-app
[dynamic-code-splitting]:
  /docs/guides/reducing-the-bundle-size#dynamic-code-splitting-with-webpack
[own-feature-service-definitions]:
  /docs/guides/writing-a-feature-app#ownfeatureservicedefinitions
[react-api]: /@feature-hub/react/
[writing-a-feature-app]: /docs/guides/writing-a-feature-app
[feature-app-in-feature-app]: /docs/guides/feature-app-in-feature-app
