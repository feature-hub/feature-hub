# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.2.0](https://github.com/sinnerschrader/feature-hub/compare/v3.1.0...v3.2.0) (2023-01-20)

**Note:** Version bump only for package @feature-hub/demos





# [3.1.0](https://github.com/sinnerschrader/feature-hub/compare/v3.0.1...v3.1.0) (2023-01-20)

**Note:** Version bump only for package @feature-hub/demos





## [3.0.1](https://github.com/sinnerschrader/feature-hub/compare/v3.0.0...v3.0.1) (2022-09-27)


### Bug Fixes

* **demos:** remove declaration of external dependencies ([0f16746](https://github.com/sinnerschrader/feature-hub/commit/0f1674614b5df88964e5f4f6bd756a4c55912f08))





# [3.0.0](https://github.com/sinnerschrader/feature-hub/compare/v2.13.1...v3.0.0) (2022-09-20)


### Bug Fixes

* **all:** declare errors as unknown ([d240934](https://github.com/sinnerschrader/feature-hub/commit/d240934454fb694d7c18a512f7f528507e44cdd7))


### Features

* **history-service:** introduce v3 of the history service ([#716](https://github.com/sinnerschrader/feature-hub/issues/716)) ([7c7c386](https://github.com/sinnerschrader/feature-hub/commit/7c7c3867be3e9b0418b7976eeea6c8544d1f9e1c))


### BREAKING CHANGES

* **history-service:** Version 5 of the `history` package is now required as
peer dependency. Some types of the root location transformer have been
slightly changed, and the deprecated `primaryConsumerId` has been
removed (replaced by `primaryConsumerHistoryKey`).





## [2.13.1](https://github.com/sinnerschrader/feature-hub/compare/v2.13.0...v2.13.1) (2022-06-20)

**Note:** Version bump only for package @feature-hub/demos





# [2.13.0](https://github.com/sinnerschrader/feature-hub/compare/v2.12.0...v2.13.0) (2022-04-04)

**Note:** Version bump only for package @feature-hub/demos





# [2.12.0](https://github.com/sinnerschrader/feature-hub/compare/v2.11.1...v2.12.0) (2022-03-31)


### Features

* **serialized-state-manager:** introduce a definition factory function ([ce6ecbb](https://github.com/sinnerschrader/feature-hub/commit/ce6ecbba04c9cac82adba4e355511cdd43c8323f))





## [2.11.1](https://github.com/sinnerschrader/feature-hub/compare/v2.11.0...v2.11.1) (2022-02-10)

**Note:** Version bump only for package @feature-hub/demos





# [2.11.0](https://github.com/sinnerschrader/feature-hub/compare/v2.10.0...v2.11.0) (2022-02-10)


### Bug Fixes

* **history-service:** compatibility with react-router-dom ([#704](https://github.com/sinnerschrader/feature-hub/issues/704)) ([9c1913f](https://github.com/sinnerschrader/feature-hub/commit/9c1913f4a64f501b97c32ae3a91a20e5ceb55d09))





# [2.10.0](https://github.com/sinnerschrader/feature-hub/compare/v2.9.0...v2.10.0) (2022-01-14)

**Note:** Version bump only for package @feature-hub/demos





# [2.9.0](https://github.com/sinnerschrader/feature-hub/compare/v2.8.1...v2.9.0) (2021-07-12)


### Bug Fixes

* **all:** handle module type during hydration ([5cd3373](https://github.com/sinnerschrader/feature-hub/commit/5cd3373bd84466a187177be22f68fb0d27029e94))
* **demos:** add missing readonly modifiers ([4b6fdb9](https://github.com/sinnerschrader/feature-hub/commit/4b6fdb9b6683a4f1e3db4310f53620ab0dc90ace))
* **demos:** add runtime check to loadNodeIntegrator ([1c9d7d3](https://github.com/sinnerschrader/feature-hub/commit/1c9d7d3f97a48cb7ba33821bad09e7a2e8ab067d))
* **demos:** avoid optional chaining operator ([83aa522](https://github.com/sinnerschrader/feature-hub/commit/83aa522ce5db5cabc7181e4f9103c6366c430302))
* **demos:** clean up unnecessary stuff ([0f5a728](https://github.com/sinnerschrader/feature-hub/commit/0f5a72876bbfb7610c95f8b8d3b7d53b152e6681))
* **demos:** postcss webpack config for todomvc ([f98a155](https://github.com/sinnerschrader/feature-hub/commit/f98a1554893da989a870d0075d6fc34e3aa4d546))
* **demos:** remove any cast from federation itest ([0059fe3](https://github.com/sinnerschrader/feature-hub/commit/0059fe380cf60736c99223f79a949392839c4ec6))
* **demos:** share React as module federation singleton ([05c159b](https://github.com/sinnerschrader/feature-hub/commit/05c159b7cc78f2430928095d92954a11d8b7b32f))
* **demos:** use blueprintjs in federation demo ([7d914b8](https://github.com/sinnerschrader/feature-hub/commit/7d914b8e2da59d8d28147687a7b7089ef80aea17))
* **demos:** use empty entry in federated module webpack config ([95073f0](https://github.com/sinnerschrader/feature-hub/commit/95073f0ea8f8454426dc350c77aad33d0d6348e2))
* **demos:** use js files for the demo server code ([a5d1fed](https://github.com/sinnerschrader/feature-hub/commit/a5d1fed4e5b4ffd086e620d7e31f9488ec116129))
* **demos:** watch node integrator ([ddb29bf](https://github.com/sinnerschrader/feature-hub/commit/ddb29bff8f2ad93559faad5d025c2169cdb0fc0d)), closes [#250](https://github.com/sinnerschrader/feature-hub/issues/250)


### Features

* **demos:** add demo with multiple module loaders ([dd4db94](https://github.com/sinnerschrader/feature-hub/commit/dd4db94473c6dca3e58e19d1bc3891e8fa7c464b))
* **demos:** update to webpack 5 ([d25da20](https://github.com/sinnerschrader/feature-hub/commit/d25da20b4d758647ff549c47e7eabb3e1d1001ea))
* **module-loader-federation:** add webpack module federation loader ([f477b17](https://github.com/sinnerschrader/feature-hub/commit/f477b17327ada133887ef57874b3c4f83cabbfe2))
* **module-loader-federation:** avoid using a factory ([16bd0d0](https://github.com/sinnerschrader/feature-hub/commit/16bd0d01403e7128407e0fa6469a275f5d85e4fb))





## [2.8.1](https://github.com/sinnerschrader/feature-hub/compare/v2.8.0...v2.8.1) (2020-11-14)

**Note:** Version bump only for package @feature-hub/demos





# [2.8.0](https://github.com/sinnerschrader/feature-hub/compare/v2.7.0...v2.8.0) (2020-10-27)


### Features

* **all:** pass featureAppName as consumerName to Feature Service binder ([#589](https://github.com/sinnerschrader/feature-hub/issues/589)) ([44b019f](https://github.com/sinnerschrader/feature-hub/commit/44b019f))





# [2.7.0](https://github.com/sinnerschrader/feature-hub/compare/v2.6.0...v2.7.0) (2020-06-11)

**Note:** Version bump only for package @feature-hub/demos





# [2.6.0](https://github.com/sinnerschrader/feature-hub/compare/v2.5.0...v2.6.0) (2020-03-20)

**Note:** Version bump only for package @feature-hub/demos





# [2.5.0](https://github.com/sinnerschrader/feature-hub/compare/v2.4.1...v2.5.0) (2020-02-19)


### Features

* **react:** allow custom feature app rendering ([#557](https://github.com/sinnerschrader/feature-hub/issues/557)) ([03a967a](https://github.com/sinnerschrader/feature-hub/commit/03a967a)), closes [#296](https://github.com/sinnerschrader/feature-hub/issues/296) [#295](https://github.com/sinnerschrader/feature-hub/issues/295)





## [2.4.1](https://github.com/sinnerschrader/feature-hub/compare/v2.4.0...v2.4.1) (2020-02-12)

**Note:** Version bump only for package @feature-hub/demos





# [2.4.0](https://github.com/sinnerschrader/feature-hub/compare/v2.3.1...v2.4.0) (2019-12-18)


### Features

* **all:** add done callback ([#549](https://github.com/sinnerschrader/feature-hub/issues/549)) ([dd9f6db](https://github.com/sinnerschrader/feature-hub/commit/dd9f6db)), closes [#545](https://github.com/sinnerschrader/feature-hub/issues/545)





## [2.3.1](https://github.com/sinnerschrader/feature-hub/compare/v2.3.0...v2.3.1) (2019-11-01)

**Note:** Version bump only for package @feature-hub/demos





# [2.3.0](https://github.com/sinnerschrader/feature-hub/compare/v2.2.1...v2.3.0) (2019-08-26)

**Note:** Version bump only for package @feature-hub/demos





## [2.2.1](https://github.com/sinnerschrader/feature-hub/compare/v2.2.0...v2.2.1) (2019-07-30)

**Note:** Version bump only for package @feature-hub/demos





# [2.2.0](https://github.com/sinnerschrader/feature-hub/compare/v2.1.1...v2.2.0) (2019-07-11)


### Features

* **demos:** use react-router in history-service demo ([#477](https://github.com/sinnerschrader/feature-hub/issues/477)) ([bd94620](https://github.com/sinnerschrader/feature-hub/commit/bd94620))





## [2.1.1](https://github.com/sinnerschrader/feature-hub/compare/v2.1.0...v2.1.1) (2019-07-06)

**Note:** Version bump only for package @feature-hub/demos





# [2.1.0](https://github.com/sinnerschrader/feature-hub/compare/v2.0.0...v2.1.0) (2019-07-05)


### Bug Fixes

* **demos:** increase feature-hub version in externals ([#516](https://github.com/sinnerschrader/feature-hub/issues/516)) ([7d98fb7](https://github.com/sinnerschrader/feature-hub/commit/7d98fb7))


### Features

* **history-service:** support multiple location changes in one navigation ([#518](https://github.com/sinnerschrader/feature-hub/issues/518)) ([1352318](https://github.com/sinnerschrader/feature-hub/commit/1352318)), closes [#496](https://github.com/sinnerschrader/feature-hub/issues/496) [#441](https://github.com/sinnerschrader/feature-hub/issues/441)





# [2.0.0](https://github.com/sinnerschrader/feature-hub/compare/v1.7.0...v2.0.0) (2019-06-20)


### Bug Fixes

* **history-service:** reorder createRootLocation params ([#511](https://github.com/sinnerschrader/feature-hub/issues/511)) ([92d6070](https://github.com/sinnerschrader/feature-hub/commit/92d6070))


### Features

* **all:** let featureAppId be defined by the integrator ([#504](https://github.com/sinnerschrader/feature-hub/issues/504)) ([2565f0c](https://github.com/sinnerschrader/feature-hub/commit/2565f0c)), closes [#495](https://github.com/sinnerschrader/feature-hub/issues/495)
* **all:** pass full env to beforeCreate callback ([#506](https://github.com/sinnerschrader/feature-hub/issues/506)) ([abeb26a](https://github.com/sinnerschrader/feature-hub/commit/abeb26a)), closes [#490](https://github.com/sinnerschrader/feature-hub/issues/490)
* **async-ssr-manager:** move timeout from config to options ([#499](https://github.com/sinnerschrader/feature-hub/issues/499)) ([9536ef7](https://github.com/sinnerschrader/feature-hub/commit/9536ef7))
* **core:** remove ability to provide configs via FeatureServiceRegistry ([#500](https://github.com/sinnerschrader/feature-hub/issues/500)) ([388b9f0](https://github.com/sinnerschrader/feature-hub/commit/388b9f0))


### BREAKING CHANGES

* **history-service:** The currentRootLocation and consumerLocation
parameters of createRootLocation have been switched.
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
* **async-ssr-manager:** The `asyncSsrManagerDefinition` has been replaced with
the factory function `defineAsyncSsrManager`. This function accepts
options to set the `timeout`, which previously had to be set by the
integrator via Feature Service configs. This is in preparation of an
upcoming breaking change that removes the ability to provide Feature
Service configs through the Feature Service registry.





# [1.7.0](https://github.com/sinnerschrader/feature-hub/compare/v1.6.0...v1.7.0) (2019-05-10)


### Features

* **all:** add beforeCreate callback ([#488](https://github.com/sinnerschrader/feature-hub/issues/488)) ([7f17c29](https://github.com/sinnerschrader/feature-hub/commit/7f17c29))





# [1.6.0](https://github.com/sinnerschrader/feature-hub/compare/v1.5.0...v1.6.0) (2019-05-03)

**Note:** Version bump only for package @feature-hub/demos





# [1.5.0](https://github.com/sinnerschrader/feature-hub/compare/v1.4.0...v1.5.0) (2019-04-16)


### Features

* **all:** specify a Feature App's base URL ([#476](https://github.com/sinnerschrader/feature-hub/issues/476)) ([5f05e7d](https://github.com/sinnerschrader/feature-hub/commit/5f05e7d))





# [1.4.0](https://github.com/sinnerschrader/feature-hub/compare/v1.3.0...v1.4.0) (2019-04-08)


### Features

* **demos:** add React Error Handling demo ([#447](https://github.com/sinnerschrader/feature-hub/issues/447)) ([05fbb75](https://github.com/sinnerschrader/feature-hub/commit/05fbb75))
* **react:** support adding Feature App stylesheets to the document during SSR ([#452](https://github.com/sinnerschrader/feature-hub/issues/452)) ([5340f28](https://github.com/sinnerschrader/feature-hub/commit/5340f28))





# [1.3.0](https://github.com/sinnerschrader/feature-hub/compare/v1.2.0...v1.3.0) (2019-03-15)


### Bug Fixes

* **demos:** implement a guard against empty todos ([#396](https://github.com/sinnerschrader/feature-hub/issues/396)) ([50276e6](https://github.com/sinnerschrader/feature-hub/commit/50276e6))
* **react:** deprecate FeatureHubContextValue interface ([#411](https://github.com/sinnerschrader/feature-hub/issues/411)) ([fc13a16](https://github.com/sinnerschrader/feature-hub/commit/fc13a16))


### Features

* **demos:** add custom logging demo ([#418](https://github.com/sinnerschrader/feature-hub/issues/418)) ([6ad41b9](https://github.com/sinnerschrader/feature-hub/commit/6ad41b9))
* **demos:** dynamize external declarations ([#389](https://github.com/sinnerschrader/feature-hub/issues/389)) ([9918fd5](https://github.com/sinnerschrader/feature-hub/commit/9918fd5))
* **demos:** use Logger Feature Service in Todo Manager ([#417](https://github.com/sinnerschrader/feature-hub/issues/417)) ([58287e5](https://github.com/sinnerschrader/feature-hub/commit/58287e5))
* **dom:** allow for container replacement ([#428](https://github.com/sinnerschrader/feature-hub/issues/428)) ([ea54ddf](https://github.com/sinnerschrader/feature-hub/commit/ea54ddf))





# [1.2.0](https://github.com/sinnerschrader/feature-hub/compare/v1.1.0...v1.2.0) (2019-02-27)


### Features

* **demos:** add todomvc demo ([#190](https://github.com/sinnerschrader/feature-hub/issues/190)) ([f48b9c9](https://github.com/sinnerschrader/feature-hub/commit/f48b9c9))
* **website:** build the todomvc demo into the website build directory ([#382](https://github.com/sinnerschrader/feature-hub/issues/382)) ([c62fae8](https://github.com/sinnerschrader/feature-hub/commit/c62fae8))





# [1.1.0](https://github.com/sinnerschrader/feature-hub/compare/v1.0.1...v1.1.0) (2019-02-25)


### Bug Fixes

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





# 0.13.0 (2019-02-07)


### Bug Fixes

* **all:** on Node 8 require URLSearchParams from url module ([#301](https://github.com/sinnerschrader/feature-hub/issues/301)) ([993b3fc](https://github.com/sinnerschrader/feature-hub/commit/993b3fc)), closes [#298](https://github.com/sinnerschrader/feature-hub/issues/298)
* **all:** update dependency ts-node to v8 ([#288](https://github.com/sinnerschrader/feature-hub/issues/288)) ([70cdf84](https://github.com/sinnerschrader/feature-hub/commit/70cdf84))
* **demos:** increase jest timeout to 120 seconds ([#302](https://github.com/sinnerschrader/feature-hub/issues/302)) ([1401852](https://github.com/sinnerschrader/feature-hub/commit/1401852))


### Features

* **all:** enforce valid semver versions for Feature Services ([#330](https://github.com/sinnerschrader/feature-hub/issues/330)) ([6cc19c6](https://github.com/sinnerschrader/feature-hub/commit/6cc19c6))
* **async-ssr-manager:** rename rerenderAfter to scheduleRerender ([#335](https://github.com/sinnerschrader/feature-hub/issues/335)) ([4477934](https://github.com/sinnerschrader/feature-hub/commit/4477934))
* **core:** integrate ExternalsValidator ([#329](https://github.com/sinnerschrader/feature-hub/issues/329)) ([864188d](https://github.com/sinnerschrader/feature-hub/commit/864188d))
* **core:** make ExternalsValidator optional for the FeatureAppManager ([#341](https://github.com/sinnerschrader/feature-hub/issues/341)) ([18fba0d](https://github.com/sinnerschrader/feature-hub/commit/18fba0d))
* **core:** make ExternalsValidator optional for the FeatureServiceRegistry ([#343](https://github.com/sinnerschrader/feature-hub/issues/343)) ([9860ff5](https://github.com/sinnerschrader/feature-hub/commit/9860ff5))
* **core:** move Feature Service dependencies into a separate key ([#314](https://github.com/sinnerschrader/feature-hub/issues/314)) ([1ad1d84](https://github.com/sinnerschrader/feature-hub/commit/1ad1d84))
* **demos:** add "Feature App in Feature App" demo ([#313](https://github.com/sinnerschrader/feature-hub/issues/313)) ([2fcecf6](https://github.com/sinnerschrader/feature-hub/commit/2fcecf6))
* **demos:** add state serialization to async-ssr-manager demo ([#291](https://github.com/sinnerschrader/feature-hub/issues/291)) ([bdbcdb1](https://github.com/sinnerschrader/feature-hub/commit/bdbcdb1))
* **demos:** enable SSR for FA-in-FA demo and fix externals config ([#326](https://github.com/sinnerschrader/feature-hub/issues/326)) ([0f13102](https://github.com/sinnerschrader/feature-hub/commit/0f13102))
* **demos:** use a FeatureAppLoader in "Feature App in Feature App" demo ([#316](https://github.com/sinnerschrader/feature-hub/issues/316)) ([333c302](https://github.com/sinnerschrader/feature-hub/commit/333c302))
* **demos:** use addUrlForHydration for preloading in ssr demo ([#322](https://github.com/sinnerschrader/feature-hub/issues/322)) ([770090a](https://github.com/sinnerschrader/feature-hub/commit/770090a))
* **react:** add FeatureHubContext ([#312](https://github.com/sinnerschrader/feature-hub/issues/312)) ([793bf05](https://github.com/sinnerschrader/feature-hub/commit/793bf05))
* **serialized-state-manager:** create package ([#287](https://github.com/sinnerschrader/feature-hub/issues/287)) ([8cadcb9](https://github.com/sinnerschrader/feature-hub/commit/8cadcb9))





# [0.12.0](https://github.com/sinnerschrader/feature-hub/compare/v0.11.0...v0.12.0) (2019-01-17)


### Bug Fixes

* **demos:** do not preload Feature App in SSR demo ([#269](https://github.com/sinnerschrader/feature-hub/issues/269)) ([661300e](https://github.com/sinnerschrader/feature-hub/commit/661300e))


### Features

* **all:** rename manager/registry to featureAppManager/featureServiceRegistry ([#247](https://github.com/sinnerschrader/feature-hub/issues/247)) ([f662c45](https://github.com/sinnerschrader/feature-hub/commit/f662c45)), closes [#25](https://github.com/sinnerschrader/feature-hub/issues/25)
* **all:** reset Feature Service versions to 0.1 ([#262](https://github.com/sinnerschrader/feature-hub/issues/262)) ([78a145f](https://github.com/sinnerschrader/feature-hub/commit/78a145f))
* **async-ssr-manager:** remove the serverRequest property ([#268](https://github.com/sinnerschrader/feature-hub/issues/268)) ([bef20d5](https://github.com/sinnerschrader/feature-hub/commit/bef20d5))
* **async-ssr-manager:** rename from server-renderer ([#243](https://github.com/sinnerschrader/feature-hub/issues/243)) ([af946fa](https://github.com/sinnerschrader/feature-hub/commit/af946fa))
* **demos:** add Async SSR Manager demo and integration test ([#251](https://github.com/sinnerschrader/feature-hub/issues/251)) ([b349021](https://github.com/sinnerschrader/feature-hub/commit/b349021))
* **demos:** respond with error page for server errors in demos ([#257](https://github.com/sinnerschrader/feature-hub/issues/257)) ([97e0484](https://github.com/sinnerschrader/feature-hub/commit/97e0484))
* **history-service:** make async-ssr-manager dependency optional ([#256](https://github.com/sinnerschrader/feature-hub/issues/256)) ([9e8be1e](https://github.com/sinnerschrader/feature-hub/commit/9e8be1e))





# [0.11.0](https://github.com/sinnerschrader/feature-hub/compare/v0.10.0...v0.11.0) (2019-01-04)


### Features

* **all:** add website package ([#208](https://github.com/sinnerschrader/feature-hub/issues/208)) ([95e1a2d](https://github.com/sinnerschrader/feature-hub/commit/95e1a2d)), closes [#119](https://github.com/sinnerschrader/feature-hub/issues/119) [#167](https://github.com/sinnerschrader/feature-hub/issues/167) [#189](https://github.com/sinnerschrader/feature-hub/issues/189) [#151](https://github.com/sinnerschrader/feature-hub/issues/151) [#138](https://github.com/sinnerschrader/feature-hub/issues/138) [#145](https://github.com/sinnerschrader/feature-hub/issues/145) [#146](https://github.com/sinnerschrader/feature-hub/issues/146)
* **all:** split module-loader into AMD and CommonJS packages ([#234](https://github.com/sinnerschrader/feature-hub/issues/234)) ([7703ada](https://github.com/sinnerschrader/feature-hub/commit/7703ada))
* **core:** rename method and improve logging ([#225](https://github.com/sinnerschrader/feature-hub/issues/225)) ([45c8906](https://github.com/sinnerschrader/feature-hub/commit/45c8906))
* **history-service:** rename interface property and method arguments ([#227](https://github.com/sinnerschrader/feature-hub/issues/227)) ([2852fb4](https://github.com/sinnerschrader/feature-hub/commit/2852fb4))
* **react:** rename nodeSrc to serverSrc ([#231](https://github.com/sinnerschrader/feature-hub/issues/231)) ([85c65a7](https://github.com/sinnerschrader/feature-hub/commit/85c65a7)), closes [#209](https://github.com/sinnerschrader/feature-hub/issues/209)





# [0.10.0](https://github.com/sinnerschrader/feature-hub/compare/v0.9.0...v0.10.0) (2018-12-20)


### Features

* **module-loader:** use standard package entry for node module loader ([#203](https://github.com/sinnerschrader/feature-hub/issues/203)) ([e380857](https://github.com/sinnerschrader/feature-hub/commit/e380857))





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





# [0.6.0](https://github.com/sinnerschrader/feature-hub/compare/v0.5.1...v0.6.0) (2018-12-13)


### Bug Fixes

* **demos:** fix demo watcher ([#180](https://github.com/sinnerschrader/feature-hub/issues/180)) ([f680f5d](https://github.com/sinnerschrader/feature-hub/commit/f680f5d))


### Features

* **demos:** add initial history service demo ([#178](https://github.com/sinnerschrader/feature-hub/issues/178)) ([cd9daf1](https://github.com/sinnerschrader/feature-hub/commit/cd9daf1))
* **demos:** rename integration-tests package to demos ([#174](https://github.com/sinnerschrader/feature-hub/issues/174)) ([1decb95](https://github.com/sinnerschrader/feature-hub/commit/1decb95))
