# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.3.0](https://github.com/sinnerschrader/feature-hub/compare/v2.2.1...v2.3.0) (2019-08-26)


### Features

* **history-service:** root location transformer createNewRootLocationForMultipleConsumers ([#539](https://github.com/sinnerschrader/feature-hub/issues/539)) ([42691cf](https://github.com/sinnerschrader/feature-hub/commit/42691cf))





## [2.2.1](https://github.com/sinnerschrader/feature-hub/compare/v2.2.0...v2.2.1) (2019-07-30)


### Bug Fixes

* **module-loader-commonjs:** avoid using fs to require commonjs module ([#533](https://github.com/sinnerschrader/feature-hub/issues/533)) ([5be4e18](https://github.com/sinnerschrader/feature-hub/commit/5be4e18)), closes [#503](https://github.com/sinnerschrader/feature-hub/issues/503)





# [2.2.0](https://github.com/sinnerschrader/feature-hub/compare/v2.1.1...v2.2.0) (2019-07-11)


### Bug Fixes

* **history-service:** set initial hash from root location on primary location ([#527](https://github.com/sinnerschrader/feature-hub/issues/527)) ([052f7aa](https://github.com/sinnerschrader/feature-hub/commit/052f7aa))


### Features

* **demos:** use react-router in history-service demo ([#477](https://github.com/sinnerschrader/feature-hub/issues/477)) ([bd94620](https://github.com/sinnerschrader/feature-hub/commit/bd94620))





## [2.1.1](https://github.com/sinnerschrader/feature-hub/compare/v2.1.0...v2.1.1) (2019-07-06)


### Bug Fixes

* **history-service:** allow LocationDescriptorObject in more places ([#522](https://github.com/sinnerschrader/feature-hub/issues/522)) ([656eeb0](https://github.com/sinnerschrader/feature-hub/commit/656eeb0))





# [2.1.0](https://github.com/sinnerschrader/feature-hub/compare/v2.0.0...v2.1.0) (2019-07-05)


### Bug Fixes

* **demos:** increase feature-hub version in externals ([#516](https://github.com/sinnerschrader/feature-hub/issues/516)) ([7d98fb7](https://github.com/sinnerschrader/feature-hub/commit/7d98fb7))


### Features

* **history-service:** support multiple location changes in one navigation ([#518](https://github.com/sinnerschrader/feature-hub/issues/518)) ([1352318](https://github.com/sinnerschrader/feature-hub/commit/1352318)), closes [#496](https://github.com/sinnerschrader/feature-hub/issues/496) [#441](https://github.com/sinnerschrader/feature-hub/issues/441)





# [2.0.0](https://github.com/sinnerschrader/feature-hub/compare/v1.7.0...v2.0.0) (2019-06-20)


### Bug Fixes

* **all:** do not destroy Feature App when it is rendered multiple times ([#512](https://github.com/sinnerschrader/feature-hub/issues/512)) ([bf8a8ad](https://github.com/sinnerschrader/feature-hub/commit/bf8a8ad)), closes [#505](https://github.com/sinnerschrader/feature-hub/issues/505)
* **all:** remove all deprecated interfaces ([#510](https://github.com/sinnerschrader/feature-hub/issues/510)) ([7df042e](https://github.com/sinnerschrader/feature-hub/commit/7df042e))
* **history-service:** reorder createRootLocation params ([#511](https://github.com/sinnerschrader/feature-hub/issues/511)) ([92d6070](https://github.com/sinnerschrader/feature-hub/commit/92d6070))


### Features

* **all:** let featureAppId be defined by the integrator ([#504](https://github.com/sinnerschrader/feature-hub/issues/504)) ([2565f0c](https://github.com/sinnerschrader/feature-hub/commit/2565f0c)), closes [#495](https://github.com/sinnerschrader/feature-hub/issues/495)
* **all:** pass full env to beforeCreate callback ([#506](https://github.com/sinnerschrader/feature-hub/issues/506)) ([abeb26a](https://github.com/sinnerschrader/feature-hub/commit/abeb26a)), closes [#490](https://github.com/sinnerschrader/feature-hub/issues/490)
* **async-ssr-manager:** move timeout from config to options ([#499](https://github.com/sinnerschrader/feature-hub/issues/499)) ([9536ef7](https://github.com/sinnerschrader/feature-hub/commit/9536ef7))
* **core:** remove ability to provide configs via FeatureServiceRegistry ([#500](https://github.com/sinnerschrader/feature-hub/issues/500)) ([388b9f0](https://github.com/sinnerschrader/feature-hub/commit/388b9f0))
* **history-service:** rename primaryConsumerUid to primaryConsumerId ([#502](https://github.com/sinnerschrader/feature-hub/issues/502)) ([49fae65](https://github.com/sinnerschrader/feature-hub/commit/49fae65))
* **react:** do not re-throw render errors on server ([#508](https://github.com/sinnerschrader/feature-hub/issues/508)) ([4b1c53e](https://github.com/sinnerschrader/feature-hub/commit/4b1c53e))


### BREAKING CHANGES

* **all:** `FeatureAppManager#getFeatureAppScope` has been
replaced by `FeatureAppManager#createFeatureAppScope`, since now a new
`FeatureAppScope` is created for every call. When a Feature App is
unmounted, the `release` method (previously called `destroy`) must be
called. Only when all scopes for a Feature App ID have been released,
the Feature App instance is destroyed.
* **history-service:** The `currentRootLocation` and `consumerLocation`
parameters of `createRootLocation` have been switched.
* **all:** The following interfaces have been removed:
  * `AsyncSsrManagerV0`
  * `ExternalsValidatorLike`
  * `FeatureAppManagerLike`
  * `FeatureServiceRegistryLike`
  * `HistoryServiceV0`
  * `FeatureHubContextValue`
  * `SerializedStateManagerV0`
  * `ServerRequestV0`
* **react:** When the `FeatureAppContainer`/`FeatureAppLoader`
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
Feature App's `create` method does not include an `instanceConfig` property
anymore. If a Feature App must be configured, the integrator needs to
specify the `config` prop of the `FeatureAppLoader` or
`FeatureAppContainer`. Furthermore, the `FeatureAppLoader` or
`FeatureAppContainer` now require a `featureAppId` prop, and the
`instanceConfig` and `idSpecifier` props have been removed. The same
applies to the `<feature-app-loader>` and `<feature-app-container>`
custom elements. Since the integrator now needs to define the ID of a
Feature App, the Feature App definition must not specify an `id`
anymore.
* **history-service:** The option `primaryConsumerUid` of
`createRootLocationTransformer` has been renamed to `primaryConsumerId`.
* **core:** The option `featureServiceConfigs` has been removed
from the options of `createFeatureHub` and from the options of the
`FeatureServiceRegistry` constructor. The `env` that is passed to a
Feature Service's `create` method does not include a `config` property
anymore. If a Feature Service must be configured, a factory function
that accepts options, and that returns a Feature Service definition,
should be used instead, see `@feature-hub/async-ssr-manager` for an
example.
* **async-ssr-manager:** The `asyncSsrManagerDefinition` has been replaced with
the factory function `defineAsyncSsrManager`. This function accepts
options to set the `timeout`, which previously had to be set by the
integrator via Feature Service configs. This is in preparation of an
upcoming breaking change that removes the ability to provide Feature
Service configs through the Feature Service registry.
* **core:** The type params of the following interfaces have been changed:
  * `FeatureAppDefinition`
  * `FeatureAppEnvironment`
  * `FeatureServiceProviderDefinition`
  * `FeatureServiceEnvironment`




# [1.7.0](https://github.com/sinnerschrader/feature-hub/compare/v1.6.0...v1.7.0) (2019-05-10)


### Features

* **all:** add beforeCreate callback ([#488](https://github.com/sinnerschrader/feature-hub/issues/488)) ([7f17c29](https://github.com/sinnerschrader/feature-hub/commit/7f17c29))





# [1.6.0](https://github.com/sinnerschrader/feature-hub/compare/v1.5.0...v1.6.0) (2019-05-03)


### Features

* **history-service:** support setting a hash by the primary consumer ([#483](https://github.com/sinnerschrader/feature-hub/issues/483)) ([8a73593](https://github.com/sinnerschrader/feature-hub/commit/8a73593))





# [1.5.0](https://github.com/sinnerschrader/feature-hub/compare/v1.4.0...v1.5.0) (2019-04-16)


### Features

* **all:** specify a Feature App's base URL ([#476](https://github.com/sinnerschrader/feature-hub/issues/476)) ([5f05e7d](https://github.com/sinnerschrader/feature-hub/commit/5f05e7d))





# [1.4.0](https://github.com/sinnerschrader/feature-hub/compare/v1.3.0...v1.4.0) (2019-04-08)


### Bug Fixes

* **module-loader-commonjs:** avoid require cache ([#448](https://github.com/sinnerschrader/feature-hub/issues/448)) ([433690e](https://github.com/sinnerschrader/feature-hub/commit/433690e))


### Features

* **demos:** add React Error Handling demo ([#447](https://github.com/sinnerschrader/feature-hub/issues/447)) ([05fbb75](https://github.com/sinnerschrader/feature-hub/commit/05fbb75))
* **react:** add onError and renderError to FeatureAppContainer ([#420](https://github.com/sinnerschrader/feature-hub/issues/420)) ([33fcce7](https://github.com/sinnerschrader/feature-hub/commit/33fcce7))
* **react:** add onError and renderError to FeatureAppLoader ([#445](https://github.com/sinnerschrader/feature-hub/issues/445)) ([2a967b5](https://github.com/sinnerschrader/feature-hub/commit/2a967b5))
* **react:** support adding Feature App stylesheets to the document during SSR ([#452](https://github.com/sinnerschrader/feature-hub/issues/452)) ([5340f28](https://github.com/sinnerschrader/feature-hub/commit/5340f28))





# [1.3.0](https://github.com/sinnerschrader/feature-hub/compare/v1.2.0...v1.3.0) (2019-03-15)


### Bug Fixes

* **demos:** implement a guard against empty todos ([#396](https://github.com/sinnerschrader/feature-hub/issues/396)) ([50276e6](https://github.com/sinnerschrader/feature-hub/commit/50276e6))
* **dom:** only render defined id specifiers ([#427](https://github.com/sinnerschrader/feature-hub/issues/427)) ([d9e1c15](https://github.com/sinnerschrader/feature-hub/commit/d9e1c15))
* **history-service:** add missing readonlys ([#416](https://github.com/sinnerschrader/feature-hub/issues/416)) ([e67fc27](https://github.com/sinnerschrader/feature-hub/commit/e67fc27))
* **react:** deprecate FeatureHubContextValue interface ([#411](https://github.com/sinnerschrader/feature-hub/issues/411)) ([fc13a16](https://github.com/sinnerschrader/feature-hub/commit/fc13a16))
* **website:** improve visibility of note boxes ([#419](https://github.com/sinnerschrader/feature-hub/issues/419)) ([4b84a71](https://github.com/sinnerschrader/feature-hub/commit/4b84a71))


### Features

* **async-ssr-manager:** use Logger Feature Service instead of console ([#415](https://github.com/sinnerschrader/feature-hub/issues/415)) ([e0f0605](https://github.com/sinnerschrader/feature-hub/commit/e0f0605))
* **core:** add logger option to FeatureAppManager, FeatureServiceRegistry, and createFeatureHub ([#404](https://github.com/sinnerschrader/feature-hub/issues/404)) ([b70557e](https://github.com/sinnerschrader/feature-hub/commit/b70557e)), closes [#402](https://github.com/sinnerschrader/feature-hub/issues/402)
* **demos:** add custom logging demo ([#418](https://github.com/sinnerschrader/feature-hub/issues/418)) ([6ad41b9](https://github.com/sinnerschrader/feature-hub/commit/6ad41b9))
* **demos:** dynamize external declarations ([#389](https://github.com/sinnerschrader/feature-hub/issues/389)) ([9918fd5](https://github.com/sinnerschrader/feature-hub/commit/9918fd5))
* **demos:** use Logger Feature Service in Todo Manager ([#417](https://github.com/sinnerschrader/feature-hub/issues/417)) ([58287e5](https://github.com/sinnerschrader/feature-hub/commit/58287e5))
* **dom:** add logger option to defineFeatureAppContainer & defineFeatureAppLoader ([#406](https://github.com/sinnerschrader/feature-hub/issues/406)) ([1716d6e](https://github.com/sinnerschrader/feature-hub/commit/1716d6e))
* **dom:** allow for container replacement ([#428](https://github.com/sinnerschrader/feature-hub/issues/428)) ([ea54ddf](https://github.com/sinnerschrader/feature-hub/commit/ea54ddf))
* **history-service:** use Logger Feature Service instead of console ([#414](https://github.com/sinnerschrader/feature-hub/issues/414)) ([a363757](https://github.com/sinnerschrader/feature-hub/commit/a363757))
* **logger:** add Logger Feature Service ([#413](https://github.com/sinnerschrader/feature-hub/issues/413)) ([97d5f3e](https://github.com/sinnerschrader/feature-hub/commit/97d5f3e))
* **react:** add custom logger option to FeatureHubContext ([#408](https://github.com/sinnerschrader/feature-hub/issues/408)) ([470acd3](https://github.com/sinnerschrader/feature-hub/commit/470acd3))





# [1.2.0](https://github.com/sinnerschrader/feature-hub/compare/v1.1.0...v1.2.0) (2019-02-27)


### Bug Fixes

* **dom:** guard against double definition ([#383](https://github.com/sinnerschrader/feature-hub/issues/383)) ([c82947c](https://github.com/sinnerschrader/feature-hub/commit/c82947c))


### Features

* **demos:** add todomvc demo ([#190](https://github.com/sinnerschrader/feature-hub/issues/190)) ([f48b9c9](https://github.com/sinnerschrader/feature-hub/commit/f48b9c9))
* **dom:** add support for instanceConfig ([#384](https://github.com/sinnerschrader/feature-hub/issues/384)) ([19555ed](https://github.com/sinnerschrader/feature-hub/commit/19555ed))
* **website:** build the todomvc demo into the website build directory ([#382](https://github.com/sinnerschrader/feature-hub/issues/382)) ([c62fae8](https://github.com/sinnerschrader/feature-hub/commit/c62fae8))





# [1.1.0](https://github.com/sinnerschrader/feature-hub/compare/v1.0.1...v1.1.0) (2019-02-25)


### Bug Fixes

* **all:** add missing sideEffects package.json entries ([#377](https://github.com/sinnerschrader/feature-hub/issues/377)) ([e3dbc78](https://github.com/sinnerschrader/feature-hub/commit/e3dbc78))
* **all:** correct interfaces of all Feature Services to reflect the switch to version 1.0.0 ([#378](https://github.com/sinnerschrader/feature-hub/issues/378)) ([da1066c](https://github.com/sinnerschrader/feature-hub/commit/da1066c))


### Features

* **dom:** create package ([#370](https://github.com/sinnerschrader/feature-hub/issues/370)) ([be2a7bb](https://github.com/sinnerschrader/feature-hub/commit/be2a7bb))





## [1.0.1](https://github.com/sinnerschrader/feature-hub/compare/v1.0.0...v1.0.1) (2019-02-15)


### Bug Fixes

* **all:** increase feature service versions ([#366](https://github.com/sinnerschrader/feature-hub/issues/366)) ([168c771](https://github.com/sinnerschrader/feature-hub/commit/168c771))
* **core:** add JSDoc comments to createFeatureHub result ([#368](https://github.com/sinnerschrader/feature-hub/issues/368)) ([95c7fb6](https://github.com/sinnerschrader/feature-hub/commit/95c7fb6))





# [1.0.0](https://github.com/sinnerschrader/feature-hub/compare/v0.13.0...v1.0.0) (2019-02-14)


### Features

* **all:** introduce instanceConfig ([#350](https://github.com/sinnerschrader/feature-hub/issues/350)) ([9a25084](https://github.com/sinnerschrader/feature-hub/commit/9a25084))
* **all:** release 1.0 🎉 ([a1794a5](https://github.com/sinnerschrader/feature-hub/commit/a1794a5))
* **core:** implement createFeatureHub function ([#356](https://github.com/sinnerschrader/feature-hub/issues/356)) ([22df643](https://github.com/sinnerschrader/feature-hub/commit/22df643))
* **react:** handle feature app errors ([#352](https://github.com/sinnerschrader/feature-hub/issues/352)) ([634c03a](https://github.com/sinnerschrader/feature-hub/commit/634c03a))





# 0.13.0 (2019-02-07)


### Bug Fixes

* **all:** on Node 8 require URLSearchParams from url module ([#301](https://github.com/sinnerschrader/feature-hub/issues/301)) ([993b3fc](https://github.com/sinnerschrader/feature-hub/commit/993b3fc)), closes [#298](https://github.com/sinnerschrader/feature-hub/issues/298)
* **all:** update dependency ts-node to v8 ([#288](https://github.com/sinnerschrader/feature-hub/issues/288)) ([70cdf84](https://github.com/sinnerschrader/feature-hub/commit/70cdf84))
* **demos:** increase jest timeout to 120 seconds ([#302](https://github.com/sinnerschrader/feature-hub/issues/302)) ([1401852](https://github.com/sinnerschrader/feature-hub/commit/1401852))
* **react:** remove mission critical feature app todos ([#297](https://github.com/sinnerschrader/feature-hub/issues/297)) ([da651bc](https://github.com/sinnerschrader/feature-hub/commit/da651bc))


### Features

* **all:** enforce valid semver versions for Feature Services ([#330](https://github.com/sinnerschrader/feature-hub/issues/330)) ([6cc19c6](https://github.com/sinnerschrader/feature-hub/commit/6cc19c6))
* **async-ssr-manager:** rename rerenderAfter to scheduleRerender ([#335](https://github.com/sinnerschrader/feature-hub/issues/335)) ([4477934](https://github.com/sinnerschrader/feature-hub/commit/4477934))
* **async-ssr-manager:** support re-scheduling rerender ([#337](https://github.com/sinnerschrader/feature-hub/issues/337)) ([2311998](https://github.com/sinnerschrader/feature-hub/commit/2311998))
* **core:** integrate ExternalsValidator ([#329](https://github.com/sinnerschrader/feature-hub/issues/329)) ([864188d](https://github.com/sinnerschrader/feature-hub/commit/864188d))
* **core:** make ExternalsValidator optional for the FeatureAppManager ([#341](https://github.com/sinnerschrader/feature-hub/issues/341)) ([18fba0d](https://github.com/sinnerschrader/feature-hub/commit/18fba0d))
* **core:** make ExternalsValidator optional for the FeatureServiceRegistry ([#343](https://github.com/sinnerschrader/feature-hub/issues/343)) ([9860ff5](https://github.com/sinnerschrader/feature-hub/commit/9860ff5))
* **core:** move Feature Service dependencies into a separate key ([#314](https://github.com/sinnerschrader/feature-hub/issues/314)) ([1ad1d84](https://github.com/sinnerschrader/feature-hub/commit/1ad1d84))
* **core:** remove FeatureAppManager#destroy ([#336](https://github.com/sinnerschrader/feature-hub/issues/336)) ([04bc770](https://github.com/sinnerschrader/feature-hub/commit/04bc770))
* **demos:** add "Feature App in Feature App" demo ([#313](https://github.com/sinnerschrader/feature-hub/issues/313)) ([2fcecf6](https://github.com/sinnerschrader/feature-hub/commit/2fcecf6))
* **demos:** add state serialization to async-ssr-manager demo ([#291](https://github.com/sinnerschrader/feature-hub/issues/291)) ([bdbcdb1](https://github.com/sinnerschrader/feature-hub/commit/bdbcdb1))
* **demos:** enable SSR for FA-in-FA demo and fix externals config ([#326](https://github.com/sinnerschrader/feature-hub/issues/326)) ([0f13102](https://github.com/sinnerschrader/feature-hub/commit/0f13102))
* **demos:** use a FeatureAppLoader in "Feature App in Feature App" demo ([#316](https://github.com/sinnerschrader/feature-hub/issues/316)) ([333c302](https://github.com/sinnerschrader/feature-hub/commit/333c302))
* **demos:** use addUrlForHydration for preloading in ssr demo ([#322](https://github.com/sinnerschrader/feature-hub/issues/322)) ([770090a](https://github.com/sinnerschrader/feature-hub/commit/770090a))
* **react:** add addUrlForHydration and integrate into FeatureAppLoader ([#320](https://github.com/sinnerschrader/feature-hub/issues/320)) ([9de6cf2](https://github.com/sinnerschrader/feature-hub/commit/9de6cf2))
* **react:** add FeatureHubContext ([#312](https://github.com/sinnerschrader/feature-hub/issues/312)) ([793bf05](https://github.com/sinnerschrader/feature-hub/commit/793bf05))
* **serialized-state-manager:** create package ([#287](https://github.com/sinnerschrader/feature-hub/issues/287)) ([8cadcb9](https://github.com/sinnerschrader/feature-hub/commit/8cadcb9))
* **serialized-state-manager:** implement public API and add JSDoc ([#290](https://github.com/sinnerschrader/feature-hub/issues/290)) ([938c8bc](https://github.com/sinnerschrader/feature-hub/commit/938c8bc))





# [0.12.0](https://github.com/sinnerschrader/feature-hub/compare/v0.11.0...v0.12.0) (2019-01-17)


### Bug Fixes

* **demos:** do not preload Feature App in SSR demo ([#269](https://github.com/sinnerschrader/feature-hub/issues/269)) ([661300e](https://github.com/sinnerschrader/feature-hub/commit/661300e))
* **server-request:** align headers with the Request interface from express ([#275](https://github.com/sinnerschrader/feature-hub/issues/275)) ([f1b05c1](https://github.com/sinnerschrader/feature-hub/commit/f1b05c1))


### Features

* **all:** rename manager/registry to featureAppManager/featureServiceRegistry ([#247](https://github.com/sinnerschrader/feature-hub/issues/247)) ([f662c45](https://github.com/sinnerschrader/feature-hub/commit/f662c45)), closes [#25](https://github.com/sinnerschrader/feature-hub/issues/25)
* **all:** reset Feature Service versions to 0.1 ([#262](https://github.com/sinnerschrader/feature-hub/issues/262)) ([78a145f](https://github.com/sinnerschrader/feature-hub/commit/78a145f))
* **async-ssr-manager:** remove the serverRequest property ([#268](https://github.com/sinnerschrader/feature-hub/issues/268)) ([bef20d5](https://github.com/sinnerschrader/feature-hub/commit/bef20d5))
* **async-ssr-manager:** rename from server-renderer ([#243](https://github.com/sinnerschrader/feature-hub/issues/243)) ([af946fa](https://github.com/sinnerschrader/feature-hub/commit/af946fa))
* **core:** add support for optional dependencies ([#244](https://github.com/sinnerschrader/feature-hub/issues/244)) ([4e3c896](https://github.com/sinnerschrader/feature-hub/commit/4e3c896))
* **core:** validate provided feature service versions on register ([#252](https://github.com/sinnerschrader/feature-hub/issues/252)) ([d6f89e8](https://github.com/sinnerschrader/feature-hub/commit/d6f89e8))
* **demos:** add Async SSR Manager demo and integration test ([#251](https://github.com/sinnerschrader/feature-hub/issues/251)) ([b349021](https://github.com/sinnerschrader/feature-hub/commit/b349021))
* **demos:** respond with error page for server errors in demos ([#257](https://github.com/sinnerschrader/feature-hub/issues/257)) ([97e0484](https://github.com/sinnerschrader/feature-hub/commit/97e0484))
* **history-service:** make async-ssr-manager dependency optional ([#256](https://github.com/sinnerschrader/feature-hub/issues/256)) ([9e8be1e](https://github.com/sinnerschrader/feature-hub/commit/9e8be1e))
* **history-service:** reduce public API surface ([#258](https://github.com/sinnerschrader/feature-hub/issues/258)) ([5f8b8ec](https://github.com/sinnerschrader/feature-hub/commit/5f8b8ec))
* **react:** add asyncSsrManager prop to FeatureAppLoader ([#248](https://github.com/sinnerschrader/feature-hub/issues/248)) ([92579d9](https://github.com/sinnerschrader/feature-hub/commit/92579d9))
* **server-renderer:** move and adapt old SSR code ([#135](https://github.com/sinnerschrader/feature-hub/issues/135)) ([b33f744](https://github.com/sinnerschrader/feature-hub/commit/b33f744))
* **server-renderer:** replace register & rerender with rerenderAfter ([#241](https://github.com/sinnerschrader/feature-hub/issues/241)) ([5fbfcc6](https://github.com/sinnerschrader/feature-hub/commit/5fbfcc6))
* **server-request:** create new feature service ([#263](https://github.com/sinnerschrader/feature-hub/issues/263)) ([c69ccc2](https://github.com/sinnerschrader/feature-hub/commit/c69ccc2))
* **website:** change size of website logo ([#253](https://github.com/sinnerschrader/feature-hub/issues/253)) ([894f709](https://github.com/sinnerschrader/feature-hub/commit/894f709))





# [0.11.0](https://github.com/sinnerschrader/feature-hub/compare/v0.10.0...v0.11.0) (2019-01-04)


### Bug Fixes

* **core:** clarify error message ([#212](https://github.com/sinnerschrader/feature-hub/issues/212)) ([e77b70b](https://github.com/sinnerschrader/feature-hub/commit/e77b70b))


### Features

* **all:** add website package ([#208](https://github.com/sinnerschrader/feature-hub/issues/208)) ([95e1a2d](https://github.com/sinnerschrader/feature-hub/commit/95e1a2d)), closes [#119](https://github.com/sinnerschrader/feature-hub/issues/119) [#167](https://github.com/sinnerschrader/feature-hub/issues/167) [#189](https://github.com/sinnerschrader/feature-hub/issues/189) [#151](https://github.com/sinnerschrader/feature-hub/issues/151) [#138](https://github.com/sinnerschrader/feature-hub/issues/138) [#145](https://github.com/sinnerschrader/feature-hub/issues/145) [#146](https://github.com/sinnerschrader/feature-hub/issues/146)
* **all:** split module-loader into AMD and CommonJS packages ([#234](https://github.com/sinnerschrader/feature-hub/issues/234)) ([7703ada](https://github.com/sinnerschrader/feature-hub/commit/7703ada))
* **core:** rename method and improve logging ([#225](https://github.com/sinnerschrader/feature-hub/issues/225)) ([45c8906](https://github.com/sinnerschrader/feature-hub/commit/45c8906))
* **core:** retain FeatureApp type in FeatureAppDefinition ([#214](https://github.com/sinnerschrader/feature-hub/issues/214)) ([91b205d](https://github.com/sinnerschrader/feature-hub/commit/91b205d))
* **history-service:** rename interface property and method arguments ([#227](https://github.com/sinnerschrader/feature-hub/issues/227)) ([2852fb4](https://github.com/sinnerschrader/feature-hub/commit/2852fb4))
* **react:** improve logging ([#226](https://github.com/sinnerschrader/feature-hub/issues/226)) ([534f9f9](https://github.com/sinnerschrader/feature-hub/commit/534f9f9))
* **react:** rename nodeSrc to serverSrc ([#231](https://github.com/sinnerschrader/feature-hub/issues/231)) ([85c65a7](https://github.com/sinnerschrader/feature-hub/commit/85c65a7)), closes [#209](https://github.com/sinnerschrader/feature-hub/issues/209)





# [0.10.0](https://github.com/sinnerschrader/feature-hub/compare/v0.9.0...v0.10.0) (2018-12-20)


### Features

* **module-loader:** use standard package entry for node module loader ([#203](https://github.com/sinnerschrader/feature-hub/issues/203)) ([e380857](https://github.com/sinnerschrader/feature-hub/commit/e380857))
* **react:** improve log message if ID specifier is missing ([#204](https://github.com/sinnerschrader/feature-hub/issues/204)) ([cc8be3d](https://github.com/sinnerschrader/feature-hub/commit/cc8be3d))





# [0.9.0](https://github.com/sinnerschrader/feature-hub/compare/v0.8.0...v0.9.0) (2018-12-20)


### Features

* **demos:** use blueprint components for amd-module-loader demo ([#196](https://github.com/sinnerschrader/feature-hub/issues/196)) ([2013ffc](https://github.com/sinnerschrader/feature-hub/commit/2013ffc))
* **history-service:** remove history package type exports ([#197](https://github.com/sinnerschrader/feature-hub/issues/197)) ([1694769](https://github.com/sinnerschrader/feature-hub/commit/1694769))





# [0.8.0](https://github.com/sinnerschrader/feature-hub/compare/v0.7.0...v0.8.0) (2018-12-19)


### Bug Fixes

* **history-service:** navigation after reload ([#175](https://github.com/sinnerschrader/feature-hub/issues/175)) ([b37eecf](https://github.com/sinnerschrader/feature-hub/commit/b37eecf)), closes [#171](https://github.com/sinnerschrader/feature-hub/issues/171)


### Features

* **demos:** add push/replace UI for further history-service itest scenarios ([#191](https://github.com/sinnerschrader/feature-hub/issues/191)) ([2c3a7d3](https://github.com/sinnerschrader/feature-hub/commit/2c3a7d3))





# [0.7.0](https://github.com/sinnerschrader/feature-hub/compare/v0.6.0...v0.7.0) (2018-12-14)


### Features

* **core:** both the manager and the registry now accept options ([#185](https://github.com/sinnerschrader/feature-hub/issues/185)) ([f04693c](https://github.com/sinnerschrader/feature-hub/commit/f04693c)), closes [#117](https://github.com/sinnerschrader/feature-hub/issues/117)
* **history-service:** history is now a peer dependency ([#184](https://github.com/sinnerschrader/feature-hub/issues/184)) ([92dc0f1](https://github.com/sinnerschrader/feature-hub/commit/92dc0f1)), closes [#129](https://github.com/sinnerschrader/feature-hub/issues/129)
* **react:** improve log messages to make them more consistent ([#187](https://github.com/sinnerschrader/feature-hub/issues/187)) ([5e3b945](https://github.com/sinnerschrader/feature-hub/commit/5e3b945)), closes [#139](https://github.com/sinnerschrader/feature-hub/issues/139)
* **react:** the loader will not try to load an empty src ([#186](https://github.com/sinnerschrader/feature-hub/issues/186)) ([236c487](https://github.com/sinnerschrader/feature-hub/commit/236c487)), closes [#150](https://github.com/sinnerschrader/feature-hub/issues/150)





# [0.6.0](https://github.com/sinnerschrader/feature-hub/compare/v0.5.1...v0.6.0) (2018-12-13)


### Bug Fixes

* **demos:** fix demo watcher ([#180](https://github.com/sinnerschrader/feature-hub/issues/180)) ([f680f5d](https://github.com/sinnerschrader/feature-hub/commit/f680f5d))


### Features

* **core:** add optional id specifier to feature app env ([#181](https://github.com/sinnerschrader/feature-hub/issues/181)) ([6c49cdc](https://github.com/sinnerschrader/feature-hub/commit/6c49cdc))
* **demos:** add initial history service demo ([#178](https://github.com/sinnerschrader/feature-hub/issues/178)) ([cd9daf1](https://github.com/sinnerschrader/feature-hub/commit/cd9daf1))
* **demos:** rename integration-tests package to demos ([#174](https://github.com/sinnerschrader/feature-hub/issues/174)) ([1decb95](https://github.com/sinnerschrader/feature-hub/commit/1decb95))





## [0.5.1](https://github.com/sinnerschrader/feature-hub/compare/v0.5.0...v0.5.1) (2018-12-11)


### Bug Fixes

* **history-service:** POP to initial location and replaced locations ([#159](https://github.com/sinnerschrader/feature-hub/issues/159)) ([4dee669](https://github.com/sinnerschrader/feature-hub/commit/4dee669)), closes [#149](https://github.com/sinnerschrader/feature-hub/issues/149)





# [0.5.0](https://github.com/sinnerschrader/feature-hub/compare/v0.4.0...v0.5.0) (2018-12-11)


### Features

* **core:** separate configs for feature apps and services ([#165](https://github.com/sinnerschrader/feature-hub/issues/165)) ([bcff8fe](https://github.com/sinnerschrader/feature-hub/commit/bcff8fe)), closes [#133](https://github.com/sinnerschrader/feature-hub/issues/133)





# [0.4.0](https://github.com/sinnerschrader/feature-hub/compare/v0.3.0...v0.4.0) (2018-12-03)


### Bug Fixes

* **all:** enable inlineSources in tsconfig to fix source maps ([#116](https://github.com/sinnerschrader/feature-hub/issues/116)) ([03f3b02](https://github.com/sinnerschrader/feature-hub/commit/03f3b02))


### Features

* **history-service:** add history feature service ([#113](https://github.com/sinnerschrader/feature-hub/issues/113)) ([309e66d](https://github.com/sinnerschrader/feature-hub/commit/309e66d)), closes [#21](https://github.com/sinnerschrader/feature-hub/issues/21)





# [0.3.0](https://github.com/sinnerschrader/feature-hub/compare/v0.2.0...v0.3.0) (2018-11-30)


### Bug Fixes

* **module-loader:** move [@feature-hub](https://github.com/feature-hub)/core to dependencies ([9d1b0f7](https://github.com/sinnerschrader/feature-hub/commit/9d1b0f7))
* **react:** move [@feature-hub](https://github.com/feature-hub)/core to dependencies ([1af784c](https://github.com/sinnerschrader/feature-hub/commit/1af784c))


### Features

* **all:** rename `featureAppKey` to `idSpecifier` ([#102](https://github.com/sinnerschrader/feature-hub/issues/102)) ([0e2da7e](https://github.com/sinnerschrader/feature-hub/commit/0e2da7e))
* **core:** rename `url` method argument of the FeatureAppManager ([#101](https://github.com/sinnerschrader/feature-hub/issues/101)) ([eb65651](https://github.com/sinnerschrader/feature-hub/commit/eb65651))
* **core:** rename the `ownFeatureServiceDefinitions` property of Feature Apps ([#100](https://github.com/sinnerschrader/feature-hub/issues/100)) ([078fa9e](https://github.com/sinnerschrader/feature-hub/commit/078fa9e))
* **examples:** setup examples workspace ([#81](https://github.com/sinnerschrader/feature-hub/issues/81)) ([170bfb4](https://github.com/sinnerschrader/feature-hub/commit/170bfb4))
* **server-renderer:** rename server-renderer package ([#99](https://github.com/sinnerschrader/feature-hub/issues/99)) ([302fcf3](https://github.com/sinnerschrader/feature-hub/commit/302fcf3))
* **server-renderer-feature-service:** create package ([7fddfbf](https://github.com/sinnerschrader/feature-hub/commit/7fddfbf)), closes [#21](https://github.com/sinnerschrader/feature-hub/issues/21) [#25](https://github.com/sinnerschrader/feature-hub/issues/25)





# [0.2.0](https://github.com/sinnerschrader/feature-hub/compare/v0.1.1...v0.2.0) (2018-11-28)


### Features

* **react:** add nodeSrc prop to FeatureAppLoader ([#78](https://github.com/sinnerschrader/feature-hub/issues/78)) ([af65f4f](https://github.com/sinnerschrader/feature-hub/commit/af65f4f))





## [0.1.1](https://github.com/sinnerschrader/feature-hub/compare/v0.1.0...v0.1.1) (2018-11-28)


### Bug Fixes

* **core:** typo in log statement ([#73](https://github.com/sinnerschrader/feature-hub/issues/73)) ([7883fd1](https://github.com/sinnerschrader/feature-hub/commit/7883fd1))





# 0.1.0 (2018-11-28)


### Features

* **all:** add initial packages ([#1](https://github.com/sinnerschrader/feature-hub/issues/1)) ([019680e](https://github.com/sinnerschrader/feature-hub/commit/019680e))
* **all:** merge all React packages, closes [#30](https://github.com/sinnerschrader/feature-hub/issues/30) ([#31](https://github.com/sinnerschrader/feature-hub/issues/31)) ([0f6fdd6](https://github.com/sinnerschrader/feature-hub/commit/0f6fdd6))
* **all:** merge module loaders to one universal package ([#36](https://github.com/sinnerschrader/feature-hub/issues/36)) ([e583b9a](https://github.com/sinnerschrader/feature-hub/commit/e583b9a))
* **all:** remove "React" prefix from both React component class names ([#14](https://github.com/sinnerschrader/feature-hub/issues/14)) ([0a795fc](https://github.com/sinnerschrader/feature-hub/commit/0a795fc))
* **core:** introduce the core package ([#18](https://github.com/sinnerschrader/feature-hub/issues/18)) ([6809578](https://github.com/sinnerschrader/feature-hub/commit/6809578))
* **module-loader:** rename module loader functions, closes [#49](https://github.com/sinnerschrader/feature-hub/issues/49) ([#51](https://github.com/sinnerschrader/feature-hub/issues/51)) ([f9be3cd](https://github.com/sinnerschrader/feature-hub/commit/f9be3cd))
