---
id: faq
title: FAQ
sidebar_label: FAQ
---

**Note:** This FAQ will be filled with more questions and answers over time.

## Can the integrator register Feature Services one by one?

Yes, but then you need to guarantee the correct order. On the other hand, all
Feature Services registered **together** using the `registerProvider` method of
the `FeatureServiceRegistry` are automatically sorted topologically and
therefore do not need to be registered in the correct order.

## Can Feature Services be dynamically loaded after initial load?

Yes, a Feature App that is loaded dynamically can
[register][own-feature-service-definitions] its own Feature Services.

[own-feature-service-definitions]:
  /docs/guides/writing-a-feature-app#ownfeatureservicedefinitions
