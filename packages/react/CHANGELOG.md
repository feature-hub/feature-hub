# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.2.0](https://github.com/sinnerschrader/feature-hub/compare/v2.1.1...v2.2.0) (2019-07-11)


### Features

* **demos:** use react-router in history-service demo ([#477](https://github.com/sinnerschrader/feature-hub/issues/477)) ([bd94620](https://github.com/sinnerschrader/feature-hub/commit/bd94620))





## [2.1.1](https://github.com/sinnerschrader/feature-hub/compare/v2.1.0...v2.1.1) (2019-07-06)

**Note:** Version bump only for package @feature-hub/react





# [2.0.0](https://github.com/sinnerschrader/feature-hub/compare/v1.7.0...v2.0.0) (2019-06-20)


### Bug Fixes

* **all:** do not destroy Feature App when it is rendered multiple times ([#512](https://github.com/sinnerschrader/feature-hub/issues/512)) ([bf8a8ad](https://github.com/sinnerschrader/feature-hub/commit/bf8a8ad)), closes [#505](https://github.com/sinnerschrader/feature-hub/issues/505)
* **all:** remove all deprecated interfaces ([#510](https://github.com/sinnerschrader/feature-hub/issues/510)) ([7df042e](https://github.com/sinnerschrader/feature-hub/commit/7df042e))


### Features

* **all:** let featureAppId be defined by the integrator ([#504](https://github.com/sinnerschrader/feature-hub/issues/504)) ([2565f0c](https://github.com/sinnerschrader/feature-hub/commit/2565f0c)), closes [#495](https://github.com/sinnerschrader/feature-hub/issues/495)
* **all:** pass full env to beforeCreate callback ([#506](https://github.com/sinnerschrader/feature-hub/issues/506)) ([abeb26a](https://github.com/sinnerschrader/feature-hub/commit/abeb26a)), closes [#490](https://github.com/sinnerschrader/feature-hub/issues/490)
* **core:** remove ability to provide configs via FeatureServiceRegistry ([#500](https://github.com/sinnerschrader/feature-hub/issues/500)) ([388b9f0](https://github.com/sinnerschrader/feature-hub/commit/388b9f0))
* **react:** do not re-throw render errors on server ([#508](https://github.com/sinnerschrader/feature-hub/issues/508)) ([4b1c53e](https://github.com/sinnerschrader/feature-hub/commit/4b1c53e))


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
* **react:** When the FeatureAppContainer/FeatureAppLoader
catches a render error on the server, this error was previously re-thrown.
To re-create this behavior, an `onError` prop must be defined that throws
the error.
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


### Features

* **react:** add onError and renderError to FeatureAppContainer ([#420](https://github.com/sinnerschrader/feature-hub/issues/420)) ([33fcce7](https://github.com/sinnerschrader/feature-hub/commit/33fcce7))
* **react:** add onError and renderError to FeatureAppLoader ([#445](https://github.com/sinnerschrader/feature-hub/issues/445)) ([2a967b5](https://github.com/sinnerschrader/feature-hub/commit/2a967b5))
* **react:** support adding Feature App stylesheets to the document during SSR ([#452](https://github.com/sinnerschrader/feature-hub/issues/452)) ([5340f28](https://github.com/sinnerschrader/feature-hub/commit/5340f28))





# [1.3.0](https://github.com/sinnerschrader/feature-hub/compare/v1.2.0...v1.3.0) (2019-03-15)


### Bug Fixes

* **react:** deprecate FeatureHubContextValue interface ([#411](https://github.com/sinnerschrader/feature-hub/issues/411)) ([fc13a16](https://github.com/sinnerschrader/feature-hub/commit/fc13a16))


### Features

* **react:** add custom logger option to FeatureHubContext ([#408](https://github.com/sinnerschrader/feature-hub/issues/408)) ([470acd3](https://github.com/sinnerschrader/feature-hub/commit/470acd3))





# [1.2.0](https://github.com/sinnerschrader/feature-hub/compare/v1.1.0...v1.2.0) (2019-02-27)


### Features

* **demos:** add todomvc demo ([#190](https://github.com/sinnerschrader/feature-hub/issues/190)) ([f48b9c9](https://github.com/sinnerschrader/feature-hub/commit/f48b9c9))





# [1.1.0](https://github.com/sinnerschrader/feature-hub/compare/v1.0.1...v1.1.0) (2019-02-25)


### Bug Fixes

* **all:** add missing sideEffects package.json entries ([#377](https://github.com/sinnerschrader/feature-hub/issues/377)) ([e3dbc78](https://github.com/sinnerschrader/feature-hub/commit/e3dbc78))
* **all:** correct interfaces of all Feature Services to reflect the switch to version 1.0.0 ([#378](https://github.com/sinnerschrader/feature-hub/issues/378)) ([da1066c](https://github.com/sinnerschrader/feature-hub/commit/da1066c))





## [1.0.1](https://github.com/sinnerschrader/feature-hub/compare/v1.0.0...v1.0.1) (2019-02-15)


### Bug Fixes

* **core:** add JSDoc comments to createFeatureHub result ([#368](https://github.com/sinnerschrader/feature-hub/issues/368)) ([95c7fb6](https://github.com/sinnerschrader/feature-hub/commit/95c7fb6))





# [1.0.0](https://github.com/sinnerschrader/feature-hub/compare/v0.13.0...v1.0.0) (2019-02-14)


### Features

* **all:** introduce instanceConfig ([#350](https://github.com/sinnerschrader/feature-hub/issues/350)) ([9a25084](https://github.com/sinnerschrader/feature-hub/commit/9a25084))
* **react:** handle feature app errors ([#352](https://github.com/sinnerschrader/feature-hub/issues/352)) ([634c03a](https://github.com/sinnerschrader/feature-hub/commit/634c03a))





# 0.13.0 (2019-02-07)


### Bug Fixes

* **react:** remove mission critical feature app todos ([#297](https://github.com/sinnerschrader/feature-hub/issues/297)) ([da651bc](https://github.com/sinnerschrader/feature-hub/commit/da651bc))


### Features

* **async-ssr-manager:** rename rerenderAfter to scheduleRerender ([#335](https://github.com/sinnerschrader/feature-hub/issues/335)) ([4477934](https://github.com/sinnerschrader/feature-hub/commit/4477934))
* **core:** remove FeatureAppManager#destroy ([#336](https://github.com/sinnerschrader/feature-hub/issues/336)) ([04bc770](https://github.com/sinnerschrader/feature-hub/commit/04bc770))
* **react:** add addUrlForHydration and integrate into FeatureAppLoader ([#320](https://github.com/sinnerschrader/feature-hub/issues/320)) ([9de6cf2](https://github.com/sinnerschrader/feature-hub/commit/9de6cf2))
* **react:** add FeatureHubContext ([#312](https://github.com/sinnerschrader/feature-hub/issues/312)) ([793bf05](https://github.com/sinnerschrader/feature-hub/commit/793bf05))
* **serialized-state-manager:** create package ([#287](https://github.com/sinnerschrader/feature-hub/issues/287)) ([8cadcb9](https://github.com/sinnerschrader/feature-hub/commit/8cadcb9))





# [0.12.0](https://github.com/sinnerschrader/feature-hub/compare/v0.11.0...v0.12.0) (2019-01-17)


### Features

* **all:** rename manager/registry to featureAppManager/featureServiceRegistry ([#247](https://github.com/sinnerschrader/feature-hub/issues/247)) ([f662c45](https://github.com/sinnerschrader/feature-hub/commit/f662c45)), closes [#25](https://github.com/sinnerschrader/feature-hub/issues/25)
* **all:** reset Feature Service versions to 0.1 ([#262](https://github.com/sinnerschrader/feature-hub/issues/262)) ([78a145f](https://github.com/sinnerschrader/feature-hub/commit/78a145f))
* **async-ssr-manager:** remove the serverRequest property ([#268](https://github.com/sinnerschrader/feature-hub/issues/268)) ([bef20d5](https://github.com/sinnerschrader/feature-hub/commit/bef20d5))
* **react:** add asyncSsrManager prop to FeatureAppLoader ([#248](https://github.com/sinnerschrader/feature-hub/issues/248)) ([92579d9](https://github.com/sinnerschrader/feature-hub/commit/92579d9))





# [0.11.0](https://github.com/sinnerschrader/feature-hub/compare/v0.10.0...v0.11.0) (2019-01-04)


### Features

* **all:** add website package ([#208](https://github.com/sinnerschrader/feature-hub/issues/208)) ([95e1a2d](https://github.com/sinnerschrader/feature-hub/commit/95e1a2d)), closes [#119](https://github.com/sinnerschrader/feature-hub/issues/119) [#167](https://github.com/sinnerschrader/feature-hub/issues/167) [#189](https://github.com/sinnerschrader/feature-hub/issues/189) [#151](https://github.com/sinnerschrader/feature-hub/issues/151) [#138](https://github.com/sinnerschrader/feature-hub/issues/138) [#145](https://github.com/sinnerschrader/feature-hub/issues/145) [#146](https://github.com/sinnerschrader/feature-hub/issues/146)
* **core:** retain FeatureApp type in FeatureAppDefinition ([#214](https://github.com/sinnerschrader/feature-hub/issues/214)) ([91b205d](https://github.com/sinnerschrader/feature-hub/commit/91b205d))
* **react:** improve logging ([#226](https://github.com/sinnerschrader/feature-hub/issues/226)) ([534f9f9](https://github.com/sinnerschrader/feature-hub/commit/534f9f9))
* **react:** rename nodeSrc to serverSrc ([#231](https://github.com/sinnerschrader/feature-hub/issues/231)) ([85c65a7](https://github.com/sinnerschrader/feature-hub/commit/85c65a7)), closes [#209](https://github.com/sinnerschrader/feature-hub/issues/209)





# [0.10.0](https://github.com/sinnerschrader/feature-hub/compare/v0.9.0...v0.10.0) (2018-12-20)


### Features

* **react:** improve log message if ID specifier is missing ([#204](https://github.com/sinnerschrader/feature-hub/issues/204)) ([cc8be3d](https://github.com/sinnerschrader/feature-hub/commit/cc8be3d))





# [0.9.0](https://github.com/sinnerschrader/feature-hub/compare/v0.8.0...v0.9.0) (2018-12-20)

**Note:** Version bump only for package @feature-hub/react





# [0.8.0](https://github.com/sinnerschrader/feature-hub/compare/v0.7.0...v0.8.0) (2018-12-19)

**Note:** Version bump only for package @feature-hub/react





# [0.7.0](https://github.com/sinnerschrader/feature-hub/compare/v0.6.0...v0.7.0) (2018-12-14)


### Features

* **react:** improve log messages to make them more consistent ([#187](https://github.com/sinnerschrader/feature-hub/issues/187)) ([5e3b945](https://github.com/sinnerschrader/feature-hub/commit/5e3b945)), closes [#139](https://github.com/sinnerschrader/feature-hub/issues/139)
* **react:** the loader will not try to load an empty src ([#186](https://github.com/sinnerschrader/feature-hub/issues/186)) ([236c487](https://github.com/sinnerschrader/feature-hub/commit/236c487)), closes [#150](https://github.com/sinnerschrader/feature-hub/issues/150)





# [0.6.0](https://github.com/sinnerschrader/feature-hub/compare/v0.5.1...v0.6.0) (2018-12-13)

**Note:** Version bump only for package @feature-hub/react





## [0.5.1](https://github.com/sinnerschrader/feature-hub/compare/v0.5.0...v0.5.1) (2018-12-11)

**Note:** Version bump only for package @feature-hub/react





# [0.5.0](https://github.com/sinnerschrader/feature-hub/compare/v0.4.0...v0.5.0) (2018-12-11)


### Features

* **core:** separate configs for feature apps and services ([#165](https://github.com/sinnerschrader/feature-hub/issues/165)) ([bcff8fe](https://github.com/sinnerschrader/feature-hub/commit/bcff8fe)), closes [#133](https://github.com/sinnerschrader/feature-hub/issues/133)





# [0.4.0](https://github.com/sinnerschrader/feature-hub/compare/v0.3.0...v0.4.0) (2018-12-03)

**Note:** Version bump only for package @feature-hub/react





# [0.3.0](https://github.com/sinnerschrader/feature-hub/compare/v0.2.0...v0.3.0) (2018-11-30)


### Bug Fixes

* **react:** move [@feature-hub](https://github.com/feature-hub)/core to dependencies ([1af784c](https://github.com/sinnerschrader/feature-hub/commit/1af784c))


### Features

* **all:** rename `featureAppKey` to `idSpecifier` ([#102](https://github.com/sinnerschrader/feature-hub/issues/102)) ([0e2da7e](https://github.com/sinnerschrader/feature-hub/commit/0e2da7e))
* **core:** rename `url` method argument of the FeatureAppManager ([#101](https://github.com/sinnerschrader/feature-hub/issues/101)) ([eb65651](https://github.com/sinnerschrader/feature-hub/commit/eb65651))
* **examples:** setup examples workspace ([#81](https://github.com/sinnerschrader/feature-hub/issues/81)) ([170bfb4](https://github.com/sinnerschrader/feature-hub/commit/170bfb4))





# [0.2.0](https://github.com/sinnerschrader/feature-hub/compare/v0.1.1...v0.2.0) (2018-11-28)


### Features

* **react:** add nodeSrc prop to FeatureAppLoader ([#78](https://github.com/sinnerschrader/feature-hub/issues/78)) ([af65f4f](https://github.com/sinnerschrader/feature-hub/commit/af65f4f))





## [0.1.1](https://github.com/sinnerschrader/feature-hub/compare/v0.1.0...v0.1.1) (2018-11-28)

**Note:** Version bump only for package @feature-hub/react





# 0.1.0 (2018-11-28)


### Features

* **all:** merge all React packages, closes [#30](https://github.com/sinnerschrader/feature-hub/issues/30) ([#31](https://github.com/sinnerschrader/feature-hub/issues/31)) ([0f6fdd6](https://github.com/sinnerschrader/feature-hub/commit/0f6fdd6))
