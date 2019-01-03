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

[own-feature-service-definitions]:
  /docs/guides/writing-a-feature-app#ownfeatureservicedefinitions
[dynamic-code-splitting]:
  /docs/guides/reducing-the-bundle-size#dynamic-code-splitting-with-webpack
