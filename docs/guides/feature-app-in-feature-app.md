---
id: feature-app-in-feature-app
title: Feature App in Feature App
sidebar_label: Feature App in Feature App
---

It is possible that a [React Feature App][react-feature-app] renders another
Feature App within itself. To do that, the parent Feature App can either [use
the `FeatureAppContainer`][react-feature-app-container] to render another
Feature App that is included in its bundle, or the parent Feature App can [use
the `FeatureAppLoader`][react-feature-app-loader] to load and render a Feature
App that is deployed independently.

The `FeatureAppContainer` and `FeatureAppLoader` both access the
`FeatureAppManager` singleton instance through React context that [the
integrator provides with the
`FeatureHubContextProvider`][placing-feature-apps-on-a-web-page-using-react]
from the [`@feature-hub/react`][react-api] package. Therefore the parent Feature
App must define `@feature-hub/react` (as well as `react` itself) as an external
dependency, and the integrator must provide it as a shared dependency (see the
["Sharing NPM Dependencies" guide][sharing-npm-dependencies] for more details).

[react-feature-app-container]:
  /docs/guides/integrating-the-feature-hub#react-feature-app-container
[placing-feature-apps-on-a-web-page-using-react]:
  /docs/guides/integrating-the-feature-hub#placing-feature-apps-on-a-web-page-using-react
[react-feature-app-loader]:
  /docs/guides/integrating-the-feature-hub#react-feature-app-loader
[react-feature-app]: /docs/guides/writing-a-feature-app#react-feature-app
[react-api]: /@feature-hub/react/
[sharing-npm-dependencies]: /docs/guides/sharing-npm-dependencies
