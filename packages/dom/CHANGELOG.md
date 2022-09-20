# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.0.0](https://github.com/sinnerschrader/feature-hub/compare/v2.13.1...v3.0.0) (2022-09-20)


### Bug Fixes

* **all:** declare errors as unknown ([d240934](https://github.com/sinnerschrader/feature-hub/commit/d240934454fb694d7c18a512f7f528507e44cdd7))





# [2.13.0](https://github.com/sinnerschrader/feature-hub/compare/v2.12.0...v2.13.0) (2022-04-04)

**Note:** Version bump only for package @feature-hub/dom





## [2.11.1](https://github.com/sinnerschrader/feature-hub/compare/v2.11.0...v2.11.1) (2022-02-10)

**Note:** Version bump only for package @feature-hub/dom





# [2.11.0](https://github.com/sinnerschrader/feature-hub/compare/v2.10.0...v2.11.0) (2022-02-10)

**Note:** Version bump only for package @feature-hub/dom





# [2.9.0](https://github.com/sinnerschrader/feature-hub/compare/v2.8.1...v2.9.0) (2021-07-12)

**Note:** Version bump only for package @feature-hub/dom





## [2.8.1](https://github.com/sinnerschrader/feature-hub/compare/v2.8.0...v2.8.1) (2020-11-14)

**Note:** Version bump only for package @feature-hub/dom





# [2.8.0](https://github.com/sinnerschrader/feature-hub/compare/v2.7.0...v2.8.0) (2020-10-27)


### Features

* **all:** pass featureAppName as consumerName to Feature Service binder ([#589](https://github.com/sinnerschrader/feature-hub/issues/589)) ([44b019f](https://github.com/sinnerschrader/feature-hub/commit/44b019f))





# [2.7.0](https://github.com/sinnerschrader/feature-hub/compare/v2.6.0...v2.7.0) (2020-06-11)

**Note:** Version bump only for package @feature-hub/dom





## [2.4.1](https://github.com/sinnerschrader/feature-hub/compare/v2.4.0...v2.4.1) (2020-02-12)

**Note:** Version bump only for package @feature-hub/dom





# [2.4.0](https://github.com/sinnerschrader/feature-hub/compare/v2.3.1...v2.4.0) (2019-12-18)

**Note:** Version bump only for package @feature-hub/dom





## [2.3.1](https://github.com/sinnerschrader/feature-hub/compare/v2.3.0...v2.3.1) (2019-11-01)

**Note:** Version bump only for package @feature-hub/dom





# [2.2.0](https://github.com/sinnerschrader/feature-hub/compare/v2.1.1...v2.2.0) (2019-07-11)

**Note:** Version bump only for package @feature-hub/dom





## [2.1.1](https://github.com/sinnerschrader/feature-hub/compare/v2.1.0...v2.1.1) (2019-07-06)

**Note:** Version bump only for package @feature-hub/dom





# [2.0.0](https://github.com/sinnerschrader/feature-hub/compare/v1.7.0...v2.0.0) (2019-06-20)


### Bug Fixes

* **all:** do not destroy Feature App when it is rendered multiple times ([#512](https://github.com/sinnerschrader/feature-hub/issues/512)) ([bf8a8ad](https://github.com/sinnerschrader/feature-hub/commit/bf8a8ad)), closes [#505](https://github.com/sinnerschrader/feature-hub/issues/505)


### Features

* **all:** let featureAppId be defined by the integrator ([#504](https://github.com/sinnerschrader/feature-hub/issues/504)) ([2565f0c](https://github.com/sinnerschrader/feature-hub/commit/2565f0c)), closes [#495](https://github.com/sinnerschrader/feature-hub/issues/495)


### BREAKING CHANGES

* **all:** `FeatureAppManager#getFeatureAppScope` has been
replaced by `FeatureAppManager#createFeatureAppScope`, since now a new
`FeatureAppScope` is created for every call. When a Feature App is
unmounted, the `release` method (previously called `destroy`) must be
called. Only when all scopes for a Feature App ID have been released,
the Feature App instance is destroyed.
* **all:** The option `featureAppConfigs` has been removed
from the options of `createFeatureHub` and from the options of the
`FeatureAppManager` constructor. The `env` that is passed to a
Feature App's `create` method does not include a `config` property
anymore. If a Feature App must be configured, the integrator needs to
specify the `config` prop of the `FeatureAppLoader` or
`FeatureAppContainer`. Furthermore, the `FeatureAppLoader` or
`FeatureAppContainer` now require a `featureAppId` prop, and the
`instanceConfig` and `idSpecifier` props have been removed. The same
applies to the `<feature-app-loader>` and `<feature-app-container>`
custom elements. Since the integrator now needs to define the ID of a
Feature App, the Feature App definition must not specify an `id`
anymore.





# [1.7.0](https://github.com/sinnerschrader/feature-hub/compare/v1.6.0...v1.7.0) (2019-05-10)

**Note:** Version bump only for package @feature-hub/dom





# [1.5.0](https://github.com/sinnerschrader/feature-hub/compare/v1.4.0...v1.5.0) (2019-04-16)


### Features

* **all:** specify a Feature App's base URL ([#476](https://github.com/sinnerschrader/feature-hub/issues/476)) ([5f05e7d](https://github.com/sinnerschrader/feature-hub/commit/5f05e7d))





# [1.4.0](https://github.com/sinnerschrader/feature-hub/compare/v1.3.0...v1.4.0) (2019-04-08)

**Note:** Version bump only for package @feature-hub/dom





# [1.3.0](https://github.com/sinnerschrader/feature-hub/compare/v1.2.0...v1.3.0) (2019-03-15)


### Bug Fixes

* **dom:** only render defined id specifiers ([#427](https://github.com/sinnerschrader/feature-hub/issues/427)) ([d9e1c15](https://github.com/sinnerschrader/feature-hub/commit/d9e1c15))


### Features

* **dom:** add logger option to defineFeatureAppContainer & defineFeatureAppLoader ([#406](https://github.com/sinnerschrader/feature-hub/issues/406)) ([1716d6e](https://github.com/sinnerschrader/feature-hub/commit/1716d6e))
* **dom:** allow for container replacement ([#428](https://github.com/sinnerschrader/feature-hub/issues/428)) ([ea54ddf](https://github.com/sinnerschrader/feature-hub/commit/ea54ddf))





# [1.2.0](https://github.com/sinnerschrader/feature-hub/compare/v1.1.0...v1.2.0) (2019-02-27)


### Bug Fixes

* **dom:** guard against double definition ([#383](https://github.com/sinnerschrader/feature-hub/issues/383)) ([c82947c](https://github.com/sinnerschrader/feature-hub/commit/c82947c))


### Features

* **dom:** add support for instanceConfig ([#384](https://github.com/sinnerschrader/feature-hub/issues/384)) ([19555ed](https://github.com/sinnerschrader/feature-hub/commit/19555ed))





# [1.1.0](https://github.com/sinnerschrader/feature-hub/compare/v1.0.1...v1.1.0) (2019-02-25)


### Bug Fixes

* **all:** add missing sideEffects package.json entries ([#377](https://github.com/sinnerschrader/feature-hub/issues/377)) ([e3dbc78](https://github.com/sinnerschrader/feature-hub/commit/e3dbc78))


### Features

* **dom:** create package ([#370](https://github.com/sinnerschrader/feature-hub/issues/370)) ([be2a7bb](https://github.com/sinnerschrader/feature-hub/commit/be2a7bb))
