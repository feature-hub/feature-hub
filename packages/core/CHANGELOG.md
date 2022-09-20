# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.0.0](https://github.com/sinnerschrader/feature-hub/compare/v2.13.1...v3.0.0) (2022-09-20)

**Note:** Version bump only for package @feature-hub/core





# [2.13.0](https://github.com/sinnerschrader/feature-hub/compare/v2.12.0...v2.13.0) (2022-04-04)


### Features

* **core:** introduce onBind callback ([04c2cfd](https://github.com/sinnerschrader/feature-hub/commit/04c2cfdec168cb041c8b27dd71f3ac759d46c313))





## [2.11.1](https://github.com/sinnerschrader/feature-hub/compare/v2.11.0...v2.11.1) (2022-02-10)


### Bug Fixes

* **core:** unbind Feature Services if Feature App fails to be created ([#705](https://github.com/sinnerschrader/feature-hub/issues/705)) ([98970ce](https://github.com/sinnerschrader/feature-hub/commit/98970ce313af0de7568ba39d5ee754773b904925))





# [2.11.0](https://github.com/sinnerschrader/feature-hub/compare/v2.10.0...v2.11.0) (2022-02-10)


### Features

* **all:** add optional result parameter to done callback ([#701](https://github.com/sinnerschrader/feature-hub/issues/701)) ([86feace](https://github.com/sinnerschrader/feature-hub/commit/86feace74abcd513caaa35b3da2562ef02cb6075))





# [2.9.0](https://github.com/sinnerschrader/feature-hub/compare/v2.8.1...v2.9.0) (2021-07-12)


### Bug Fixes

* **all:** handle module type during hydration ([5cd3373](https://github.com/sinnerschrader/feature-hub/commit/5cd3373bd84466a187177be22f68fb0d27029e94))


### Features

* **core:** enhance module loader with module type ([ed56640](https://github.com/sinnerschrader/feature-hub/commit/ed5664083c02a2e2f849e1ab914b7253074a7ea2))





## [2.8.1](https://github.com/sinnerschrader/feature-hub/compare/v2.8.0...v2.8.1) (2020-11-14)


### Bug Fixes

* **core:** update semver to reduce size ([#616](https://github.com/sinnerschrader/feature-hub/issues/616)) ([e257e9a](https://github.com/sinnerschrader/feature-hub/commit/e257e9a44b2ed292f610c0f1b325cc4f2e2012dc)), closes [#130](https://github.com/sinnerschrader/feature-hub/issues/130)





# [2.8.0](https://github.com/sinnerschrader/feature-hub/compare/v2.7.0...v2.8.0) (2020-10-27)


### Features

* **all:** pass featureAppName as consumerName to Feature Service binder ([#589](https://github.com/sinnerschrader/feature-hub/issues/589)) ([44b019f](https://github.com/sinnerschrader/feature-hub/commit/44b019f))





# [2.7.0](https://github.com/sinnerschrader/feature-hub/compare/v2.6.0...v2.7.0) (2020-06-11)


### Features

* **core:** allow returning undefined in feature service's create method ([#587](https://github.com/sinnerschrader/feature-hub/issues/587)) ([ae53268](https://github.com/sinnerschrader/feature-hub/commit/ae53268)), closes [#582](https://github.com/sinnerschrader/feature-hub/issues/582)





## [2.4.1](https://github.com/sinnerschrader/feature-hub/compare/v2.4.0...v2.4.1) (2020-02-12)


### Bug Fixes

* **core:** avoid wrong featureServiceAlreadyRegistered logs ([#560](https://github.com/sinnerschrader/feature-hub/issues/560)) ([80eb1bf](https://github.com/sinnerschrader/feature-hub/commit/80eb1bf))





# [2.4.0](https://github.com/sinnerschrader/feature-hub/compare/v2.3.1...v2.4.0) (2019-12-18)


### Features

* **all:** add done callback ([#549](https://github.com/sinnerschrader/feature-hub/issues/549)) ([dd9f6db](https://github.com/sinnerschrader/feature-hub/commit/dd9f6db)), closes [#545](https://github.com/sinnerschrader/feature-hub/issues/545)





## [2.3.1](https://github.com/sinnerschrader/feature-hub/compare/v2.3.0...v2.3.1) (2019-11-01)


### Bug Fixes

* **core:** coerce dependency versions to caret ranges ([#543](https://github.com/sinnerschrader/feature-hub/issues/543)) ([915012f](https://github.com/sinnerschrader/feature-hub/commit/915012f))





# [2.2.0](https://github.com/sinnerschrader/feature-hub/compare/v2.1.1...v2.2.0) (2019-07-11)

**Note:** Version bump only for package @feature-hub/core





## [2.1.1](https://github.com/sinnerschrader/feature-hub/compare/v2.1.0...v2.1.1) (2019-07-06)

**Note:** Version bump only for package @feature-hub/core





# [2.0.0](https://github.com/sinnerschrader/feature-hub/compare/v1.7.0...v2.0.0) (2019-06-20)


### Bug Fixes

* **all:** do not destroy Feature App when it is rendered multiple times ([#512](https://github.com/sinnerschrader/feature-hub/issues/512)) ([bf8a8ad](https://github.com/sinnerschrader/feature-hub/commit/bf8a8ad)), closes [#505](https://github.com/sinnerschrader/feature-hub/issues/505)
* **all:** remove all deprecated interfaces ([#510](https://github.com/sinnerschrader/feature-hub/issues/510)) ([7df042e](https://github.com/sinnerschrader/feature-hub/commit/7df042e))


### Features

* **all:** let featureAppId be defined by the integrator ([#504](https://github.com/sinnerschrader/feature-hub/issues/504)) ([2565f0c](https://github.com/sinnerschrader/feature-hub/commit/2565f0c)), closes [#495](https://github.com/sinnerschrader/feature-hub/issues/495)
* **all:** pass full env to beforeCreate callback ([#506](https://github.com/sinnerschrader/feature-hub/issues/506)) ([abeb26a](https://github.com/sinnerschrader/feature-hub/commit/abeb26a)), closes [#490](https://github.com/sinnerschrader/feature-hub/issues/490)
* **core:** remove ability to provide configs via FeatureServiceRegistry ([#500](https://github.com/sinnerschrader/feature-hub/issues/500)) ([388b9f0](https://github.com/sinnerschrader/feature-hub/commit/388b9f0))


### BREAKING CHANGES

* **all:** `FeatureAppManager#getFeatureAppScope` has been
replaced by `FeatureAppManager#createFeatureAppScope`, since now a new
`FeatureAppScope` is created for every call. When a Feature App is
unmounted, the `release` method (previously called `destroy`) must be
called. Only when all scopes for a Feature App ID have been released,
the Feature App instance is destroyed.
* **all:** The following interfaces have been removed:
- AsyncSsrManagerV0
- ExternalsValidatorLike
- FeatureAppManagerLike
- FeatureServiceRegistryLike
- HistoryServiceV0
- FeatureHubContextValue
- SerializedStateManagerV0
- ServerRequestV0
* **all:** Instead of passing the `featureAppId` and the
`featureServices` as separate arguments to the `beforeCreate` callback,
the full Feature App environment, that contains the `featureAppId` and
`featureServices`, is now passed as a single argument (`env`). This is
the same argument that is passed to the Feature App's `create` method.
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
* **core:** The option `featureServiceConfigs` has been removed
from the options of `createFeatureHub` and from the options of the
`FeatureServiceRegistry` constructor. The `env` that is passed to a
Feature Service's `create` method does not include a `config` property
anymore. If a Feature Service must be configured, a factory function
that accepts options, and that returns a Feature Service definition,
should be used instead, see `@feature-hub/async-ssr-manager` for an
example.





# [1.7.0](https://github.com/sinnerschrader/feature-hub/compare/v1.6.0...v1.7.0) (2019-05-10)


### Features

* **all:** add beforeCreate callback ([#488](https://github.com/sinnerschrader/feature-hub/issues/488)) ([7f17c29](https://github.com/sinnerschrader/feature-hub/commit/7f17c29))





# [1.5.0](https://github.com/sinnerschrader/feature-hub/compare/v1.4.0...v1.5.0) (2019-04-16)


### Features

* **all:** specify a Feature App's base URL ([#476](https://github.com/sinnerschrader/feature-hub/issues/476)) ([5f05e7d](https://github.com/sinnerschrader/feature-hub/commit/5f05e7d))





# [1.4.0](https://github.com/sinnerschrader/feature-hub/compare/v1.3.0...v1.4.0) (2019-04-08)

**Note:** Version bump only for package @feature-hub/core





# [1.3.0](https://github.com/sinnerschrader/feature-hub/compare/v1.2.0...v1.3.0) (2019-03-15)


### Features

* **core:** add logger option to FeatureAppManager, FeatureServiceRegistry, and createFeatureHub ([#404](https://github.com/sinnerschrader/feature-hub/issues/404)) ([b70557e](https://github.com/sinnerschrader/feature-hub/commit/b70557e)), closes [#402](https://github.com/sinnerschrader/feature-hub/issues/402)





# [1.1.0](https://github.com/sinnerschrader/feature-hub/compare/v1.0.1...v1.1.0) (2019-02-25)


### Bug Fixes

* **all:** add missing sideEffects package.json entries ([#377](https://github.com/sinnerschrader/feature-hub/issues/377)) ([e3dbc78](https://github.com/sinnerschrader/feature-hub/commit/e3dbc78))





## [1.0.1](https://github.com/sinnerschrader/feature-hub/compare/v1.0.0...v1.0.1) (2019-02-15)


### Bug Fixes

* **core:** add JSDoc comments to createFeatureHub result ([#368](https://github.com/sinnerschrader/feature-hub/issues/368)) ([95c7fb6](https://github.com/sinnerschrader/feature-hub/commit/95c7fb6))





# [1.0.0](https://github.com/sinnerschrader/feature-hub/compare/v0.13.0...v1.0.0) (2019-02-14)


### Features

* **all:** introduce instanceConfig ([#350](https://github.com/sinnerschrader/feature-hub/issues/350)) ([9a25084](https://github.com/sinnerschrader/feature-hub/commit/9a25084))
* **core:** implement createFeatureHub function ([#356](https://github.com/sinnerschrader/feature-hub/issues/356)) ([22df643](https://github.com/sinnerschrader/feature-hub/commit/22df643))





# 0.13.0 (2019-02-07)


### Features

* **all:** enforce valid semver versions for Feature Services ([#330](https://github.com/sinnerschrader/feature-hub/issues/330)) ([6cc19c6](https://github.com/sinnerschrader/feature-hub/commit/6cc19c6))
* **core:** integrate ExternalsValidator ([#329](https://github.com/sinnerschrader/feature-hub/issues/329)) ([864188d](https://github.com/sinnerschrader/feature-hub/commit/864188d))
* **core:** make ExternalsValidator optional for the FeatureAppManager ([#341](https://github.com/sinnerschrader/feature-hub/issues/341)) ([18fba0d](https://github.com/sinnerschrader/feature-hub/commit/18fba0d))
* **core:** make ExternalsValidator optional for the FeatureServiceRegistry ([#343](https://github.com/sinnerschrader/feature-hub/issues/343)) ([9860ff5](https://github.com/sinnerschrader/feature-hub/commit/9860ff5))
* **core:** move Feature Service dependencies into a separate key ([#314](https://github.com/sinnerschrader/feature-hub/issues/314)) ([1ad1d84](https://github.com/sinnerschrader/feature-hub/commit/1ad1d84))
* **core:** remove FeatureAppManager#destroy ([#336](https://github.com/sinnerschrader/feature-hub/issues/336)) ([04bc770](https://github.com/sinnerschrader/feature-hub/commit/04bc770))
* **serialized-state-manager:** create package ([#287](https://github.com/sinnerschrader/feature-hub/issues/287)) ([8cadcb9](https://github.com/sinnerschrader/feature-hub/commit/8cadcb9))





# [0.12.0](https://github.com/sinnerschrader/feature-hub/compare/v0.11.0...v0.12.0) (2019-01-17)


### Features

* **all:** rename manager/registry to featureAppManager/featureServiceRegistry ([#247](https://github.com/sinnerschrader/feature-hub/issues/247)) ([f662c45](https://github.com/sinnerschrader/feature-hub/commit/f662c45)), closes [#25](https://github.com/sinnerschrader/feature-hub/issues/25)
* **async-ssr-manager:** remove the serverRequest property ([#268](https://github.com/sinnerschrader/feature-hub/issues/268)) ([bef20d5](https://github.com/sinnerschrader/feature-hub/commit/bef20d5))
* **core:** add support for optional dependencies ([#244](https://github.com/sinnerschrader/feature-hub/issues/244)) ([4e3c896](https://github.com/sinnerschrader/feature-hub/commit/4e3c896))
* **core:** validate provided feature service versions on register ([#252](https://github.com/sinnerschrader/feature-hub/issues/252)) ([d6f89e8](https://github.com/sinnerschrader/feature-hub/commit/d6f89e8))





# [0.11.0](https://github.com/sinnerschrader/feature-hub/compare/v0.10.0...v0.11.0) (2019-01-04)


### Bug Fixes

* **core:** clarify error message ([#212](https://github.com/sinnerschrader/feature-hub/issues/212)) ([e77b70b](https://github.com/sinnerschrader/feature-hub/commit/e77b70b))


### Features

* **all:** add website package ([#208](https://github.com/sinnerschrader/feature-hub/issues/208)) ([95e1a2d](https://github.com/sinnerschrader/feature-hub/commit/95e1a2d)), closes [#119](https://github.com/sinnerschrader/feature-hub/issues/119) [#167](https://github.com/sinnerschrader/feature-hub/issues/167) [#189](https://github.com/sinnerschrader/feature-hub/issues/189) [#151](https://github.com/sinnerschrader/feature-hub/issues/151) [#138](https://github.com/sinnerschrader/feature-hub/issues/138) [#145](https://github.com/sinnerschrader/feature-hub/issues/145) [#146](https://github.com/sinnerschrader/feature-hub/issues/146)
* **core:** rename method and improve logging ([#225](https://github.com/sinnerschrader/feature-hub/issues/225)) ([45c8906](https://github.com/sinnerschrader/feature-hub/commit/45c8906))
* **core:** retain FeatureApp type in FeatureAppDefinition ([#214](https://github.com/sinnerschrader/feature-hub/issues/214)) ([91b205d](https://github.com/sinnerschrader/feature-hub/commit/91b205d))





# [0.10.0](https://github.com/sinnerschrader/feature-hub/compare/v0.9.0...v0.10.0) (2018-12-20)

**Note:** Version bump only for package @feature-hub/core





# [0.9.0](https://github.com/sinnerschrader/feature-hub/compare/v0.8.0...v0.9.0) (2018-12-20)

**Note:** Version bump only for package @feature-hub/core





# [0.8.0](https://github.com/sinnerschrader/feature-hub/compare/v0.7.0...v0.8.0) (2018-12-19)

**Note:** Version bump only for package @feature-hub/core





# [0.7.0](https://github.com/sinnerschrader/feature-hub/compare/v0.6.0...v0.7.0) (2018-12-14)


### Features

* **core:** both the manager and the registry now accept options ([#185](https://github.com/sinnerschrader/feature-hub/issues/185)) ([f04693c](https://github.com/sinnerschrader/feature-hub/commit/f04693c)), closes [#117](https://github.com/sinnerschrader/feature-hub/issues/117)





# [0.6.0](https://github.com/sinnerschrader/feature-hub/compare/v0.5.1...v0.6.0) (2018-12-13)


### Features

* **core:** add optional id specifier to feature app env ([#181](https://github.com/sinnerschrader/feature-hub/issues/181)) ([6c49cdc](https://github.com/sinnerschrader/feature-hub/commit/6c49cdc))





# [0.5.0](https://github.com/sinnerschrader/feature-hub/compare/v0.4.0...v0.5.0) (2018-12-11)


### Features

* **core:** separate configs for feature apps and services ([#165](https://github.com/sinnerschrader/feature-hub/issues/165)) ([bcff8fe](https://github.com/sinnerschrader/feature-hub/commit/bcff8fe)), closes [#133](https://github.com/sinnerschrader/feature-hub/issues/133)





# [0.4.0](https://github.com/sinnerschrader/feature-hub/compare/v0.3.0...v0.4.0) (2018-12-03)

**Note:** Version bump only for package @feature-hub/core





# [0.3.0](https://github.com/sinnerschrader/feature-hub/compare/v0.2.0...v0.3.0) (2018-11-30)


### Features

* **all:** rename `featureAppKey` to `idSpecifier` ([#102](https://github.com/sinnerschrader/feature-hub/issues/102)) ([0e2da7e](https://github.com/sinnerschrader/feature-hub/commit/0e2da7e))
* **core:** rename `url` method argument of the FeatureAppManager ([#101](https://github.com/sinnerschrader/feature-hub/issues/101)) ([eb65651](https://github.com/sinnerschrader/feature-hub/commit/eb65651))
* **core:** rename the `ownFeatureServiceDefinitions` property of Feature Apps ([#100](https://github.com/sinnerschrader/feature-hub/issues/100)) ([078fa9e](https://github.com/sinnerschrader/feature-hub/commit/078fa9e))
* **examples:** setup examples workspace ([#81](https://github.com/sinnerschrader/feature-hub/issues/81)) ([170bfb4](https://github.com/sinnerschrader/feature-hub/commit/170bfb4))





# [0.2.0](https://github.com/sinnerschrader/feature-hub/compare/v0.1.1...v0.2.0) (2018-11-28)

**Note:** Version bump only for package @feature-hub/core





## [0.1.1](https://github.com/sinnerschrader/feature-hub/compare/v0.1.0...v0.1.1) (2018-11-28)


### Bug Fixes

* **core:** typo in log statement ([#73](https://github.com/sinnerschrader/feature-hub/issues/73)) ([7883fd1](https://github.com/sinnerschrader/feature-hub/commit/7883fd1))





# 0.1.0 (2018-11-28)


### Features

* **all:** merge module loaders to one universal package ([#36](https://github.com/sinnerschrader/feature-hub/issues/36)) ([e583b9a](https://github.com/sinnerschrader/feature-hub/commit/e583b9a))
* **core:** introduce the core package ([#18](https://github.com/sinnerschrader/feature-hub/issues/18)) ([6809578](https://github.com/sinnerschrader/feature-hub/commit/6809578))
