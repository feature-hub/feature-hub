# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [3.0.1](https://github.com/sinnerschrader/feature-hub/compare/v3.0.0...v3.0.1) (2022-09-27)


### Bug Fixes

* **history-service:** do not ignore consumer history changes on root location push ([#720](https://github.com/sinnerschrader/feature-hub/issues/720)) ([e14568c](https://github.com/sinnerschrader/feature-hub/commit/e14568cf64e9a9cd9f2f07bae8d972c0c15d8ded))





# [3.0.0](https://github.com/sinnerschrader/feature-hub/compare/v2.13.1...v3.0.0) (2022-09-20)


### Features

* **history-service:** introduce v3 of the history service ([#716](https://github.com/sinnerschrader/feature-hub/issues/716)) ([7c7c386](https://github.com/sinnerschrader/feature-hub/commit/7c7c3867be3e9b0418b7976eeea6c8544d1f9e1c))


### BREAKING CHANGES

* **history-service:** Version 5 of the `history` package is now required as
peer dependency. Some types of the root location transformer have been
slightly changed, and the deprecated `primaryConsumerId` has been
removed (replaced by `primaryConsumerHistoryKey`).





# [2.13.0](https://github.com/sinnerschrader/feature-hub/compare/v2.12.0...v2.13.0) (2022-04-04)

**Note:** Version bump only for package @feature-hub/history-service





## [2.11.1](https://github.com/sinnerschrader/feature-hub/compare/v2.11.0...v2.11.1) (2022-02-10)

**Note:** Version bump only for package @feature-hub/history-service





# [2.11.0](https://github.com/sinnerschrader/feature-hub/compare/v2.10.0...v2.11.0) (2022-02-10)


### Bug Fixes

* **history-service:** compatibility with react-router-dom ([#704](https://github.com/sinnerschrader/feature-hub/issues/704)) ([9c1913f](https://github.com/sinnerschrader/feature-hub/commit/9c1913f4a64f501b97c32ae3a91a20e5ceb55d09))





# [2.10.0](https://github.com/sinnerschrader/feature-hub/compare/v2.9.0...v2.10.0) (2022-01-14)

**Note:** Version bump only for package @feature-hub/history-service





# [2.9.0](https://github.com/sinnerschrader/feature-hub/compare/v2.8.1...v2.9.0) (2021-07-12)

**Note:** Version bump only for package @feature-hub/history-service





## [2.8.1](https://github.com/sinnerschrader/feature-hub/compare/v2.8.0...v2.8.1) (2020-11-14)

**Note:** Version bump only for package @feature-hub/history-service





# [2.8.0](https://github.com/sinnerschrader/feature-hub/compare/v2.7.0...v2.8.0) (2020-10-27)

**Note:** Version bump only for package @feature-hub/history-service





# [2.7.0](https://github.com/sinnerschrader/feature-hub/compare/v2.6.0...v2.7.0) (2020-06-11)


### Features

* **core:** allow returning undefined in feature service's create method ([#587](https://github.com/sinnerschrader/feature-hub/issues/587)) ([ae53268](https://github.com/sinnerschrader/feature-hub/commit/ae53268)), closes [#582](https://github.com/sinnerschrader/feature-hub/issues/582)





## [2.4.1](https://github.com/sinnerschrader/feature-hub/compare/v2.4.0...v2.4.1) (2020-02-12)


### Bug Fixes

* **history-service:** handle absolute server request urls ([#561](https://github.com/sinnerschrader/feature-hub/issues/561)) ([be84e93](https://github.com/sinnerschrader/feature-hub/commit/be84e93))





# [2.4.0](https://github.com/sinnerschrader/feature-hub/compare/v2.3.1...v2.4.0) (2019-12-18)

**Note:** Version bump only for package @feature-hub/history-service





## [2.3.1](https://github.com/sinnerschrader/feature-hub/compare/v2.3.0...v2.3.1) (2019-11-01)

**Note:** Version bump only for package @feature-hub/history-service





# [2.3.0](https://github.com/sinnerschrader/feature-hub/compare/v2.2.1...v2.3.0) (2019-08-26)


### Features

* **history-service:** root location transformer createNewRootLocationForMultipleConsumers ([#539](https://github.com/sinnerschrader/feature-hub/issues/539)) ([42691cf](https://github.com/sinnerschrader/feature-hub/commit/42691cf))





# [2.2.0](https://github.com/sinnerschrader/feature-hub/compare/v2.1.1...v2.2.0) (2019-07-11)


### Bug Fixes

* **history-service:** set initial hash from root location on primary location ([#527](https://github.com/sinnerschrader/feature-hub/issues/527)) ([052f7aa](https://github.com/sinnerschrader/feature-hub/commit/052f7aa))





## [2.1.1](https://github.com/sinnerschrader/feature-hub/compare/v2.1.0...v2.1.1) (2019-07-06)


### Bug Fixes

* **history-service:** allow LocationDescriptorObject in more places ([#522](https://github.com/sinnerschrader/feature-hub/issues/522)) ([656eeb0](https://github.com/sinnerschrader/feature-hub/commit/656eeb0))





# [2.1.0](https://github.com/sinnerschrader/feature-hub/compare/v2.0.0...v2.1.0) (2019-07-05)


### Features

* **history-service:** support multiple location changes in one navigation ([#518](https://github.com/sinnerschrader/feature-hub/issues/518)) ([1352318](https://github.com/sinnerschrader/feature-hub/commit/1352318)), closes [#496](https://github.com/sinnerschrader/feature-hub/issues/496) [#441](https://github.com/sinnerschrader/feature-hub/issues/441)





# [2.0.0](https://github.com/sinnerschrader/feature-hub/compare/v1.7.0...v2.0.0) (2019-06-20)


### Bug Fixes

* **all:** remove all deprecated interfaces ([#510](https://github.com/sinnerschrader/feature-hub/issues/510)) ([7df042e](https://github.com/sinnerschrader/feature-hub/commit/7df042e))
* **history-service:** reorder createRootLocation params ([#511](https://github.com/sinnerschrader/feature-hub/issues/511)) ([92d6070](https://github.com/sinnerschrader/feature-hub/commit/92d6070))


### Features

* **core:** remove ability to provide configs via FeatureServiceRegistry ([#500](https://github.com/sinnerschrader/feature-hub/issues/500)) ([388b9f0](https://github.com/sinnerschrader/feature-hub/commit/388b9f0))
* **history-service:** rename primaryConsumerUid to primaryConsumerId ([#502](https://github.com/sinnerschrader/feature-hub/issues/502)) ([49fae65](https://github.com/sinnerschrader/feature-hub/commit/49fae65))


### BREAKING CHANGES

* **history-service:** The currentRootLocation and consumerLocation
parameters of createRootLocation have been switched.
* **all:** The following interfaces have been removed:
- AsyncSsrManagerV0
- ExternalsValidatorLike
- FeatureAppManagerLike
- FeatureServiceRegistryLike
- HistoryServiceV0
- FeatureHubContextValue
- SerializedStateManagerV0
- ServerRequestV0
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





# [1.7.0](https://github.com/sinnerschrader/feature-hub/compare/v1.6.0...v1.7.0) (2019-05-10)

**Note:** Version bump only for package @feature-hub/history-service





# [1.6.0](https://github.com/sinnerschrader/feature-hub/compare/v1.5.0...v1.6.0) (2019-05-03)


### Features

* **history-service:** support setting a hash by the primary consumer ([#483](https://github.com/sinnerschrader/feature-hub/issues/483)) ([8a73593](https://github.com/sinnerschrader/feature-hub/commit/8a73593))





# [1.5.0](https://github.com/sinnerschrader/feature-hub/compare/v1.4.0...v1.5.0) (2019-04-16)

**Note:** Version bump only for package @feature-hub/history-service





# [1.4.0](https://github.com/sinnerschrader/feature-hub/compare/v1.3.0...v1.4.0) (2019-04-08)

**Note:** Version bump only for package @feature-hub/history-service





# [1.3.0](https://github.com/sinnerschrader/feature-hub/compare/v1.2.0...v1.3.0) (2019-03-15)


### Bug Fixes

* **history-service:** add missing readonlys ([#416](https://github.com/sinnerschrader/feature-hub/issues/416)) ([e67fc27](https://github.com/sinnerschrader/feature-hub/commit/e67fc27))


### Features

* **history-service:** use Logger Feature Service instead of console ([#414](https://github.com/sinnerschrader/feature-hub/issues/414)) ([a363757](https://github.com/sinnerschrader/feature-hub/commit/a363757))





# [1.1.0](https://github.com/sinnerschrader/feature-hub/compare/v1.0.1...v1.1.0) (2019-02-25)


### Bug Fixes

* **all:** add missing sideEffects package.json entries ([#377](https://github.com/sinnerschrader/feature-hub/issues/377)) ([e3dbc78](https://github.com/sinnerschrader/feature-hub/commit/e3dbc78))
* **all:** correct interfaces of all Feature Services to reflect the switch to version 1.0.0 ([#378](https://github.com/sinnerschrader/feature-hub/issues/378)) ([da1066c](https://github.com/sinnerschrader/feature-hub/commit/da1066c))





## [1.0.1](https://github.com/sinnerschrader/feature-hub/compare/v1.0.0...v1.0.1) (2019-02-15)


### Bug Fixes

* **all:** increase feature service versions ([#366](https://github.com/sinnerschrader/feature-hub/issues/366)) ([168c771](https://github.com/sinnerschrader/feature-hub/commit/168c771))





# [1.0.0](https://github.com/sinnerschrader/feature-hub/compare/v0.13.0...v1.0.0) (2019-02-14)

**Note:** Version bump only for package @feature-hub/history-service





# 0.13.0 (2019-02-07)


### Bug Fixes

* **all:** on Node 8 require URLSearchParams from url module ([#301](https://github.com/sinnerschrader/feature-hub/issues/301)) ([993b3fc](https://github.com/sinnerschrader/feature-hub/commit/993b3fc)), closes [#298](https://github.com/sinnerschrader/feature-hub/issues/298)


### Features

* **all:** enforce valid semver versions for Feature Services ([#330](https://github.com/sinnerschrader/feature-hub/issues/330)) ([6cc19c6](https://github.com/sinnerschrader/feature-hub/commit/6cc19c6))
* **core:** move Feature Service dependencies into a separate key ([#314](https://github.com/sinnerschrader/feature-hub/issues/314)) ([1ad1d84](https://github.com/sinnerschrader/feature-hub/commit/1ad1d84))
* **serialized-state-manager:** create package ([#287](https://github.com/sinnerschrader/feature-hub/issues/287)) ([8cadcb9](https://github.com/sinnerschrader/feature-hub/commit/8cadcb9))





# [0.12.0](https://github.com/sinnerschrader/feature-hub/compare/v0.11.0...v0.12.0) (2019-01-17)


### Features

* **all:** reset Feature Service versions to 0.1 ([#262](https://github.com/sinnerschrader/feature-hub/issues/262)) ([78a145f](https://github.com/sinnerschrader/feature-hub/commit/78a145f))
* **async-ssr-manager:** remove the serverRequest property ([#268](https://github.com/sinnerschrader/feature-hub/issues/268)) ([bef20d5](https://github.com/sinnerschrader/feature-hub/commit/bef20d5))
* **async-ssr-manager:** rename from server-renderer ([#243](https://github.com/sinnerschrader/feature-hub/issues/243)) ([af946fa](https://github.com/sinnerschrader/feature-hub/commit/af946fa))
* **history-service:** make async-ssr-manager dependency optional ([#256](https://github.com/sinnerschrader/feature-hub/issues/256)) ([9e8be1e](https://github.com/sinnerschrader/feature-hub/commit/9e8be1e))
* **history-service:** reduce public API surface ([#258](https://github.com/sinnerschrader/feature-hub/issues/258)) ([5f8b8ec](https://github.com/sinnerschrader/feature-hub/commit/5f8b8ec))
* **server-renderer:** move and adapt old SSR code ([#135](https://github.com/sinnerschrader/feature-hub/issues/135)) ([b33f744](https://github.com/sinnerschrader/feature-hub/commit/b33f744))





# [0.11.0](https://github.com/sinnerschrader/feature-hub/compare/v0.10.0...v0.11.0) (2019-01-04)


### Features

* **all:** add website package ([#208](https://github.com/sinnerschrader/feature-hub/issues/208)) ([95e1a2d](https://github.com/sinnerschrader/feature-hub/commit/95e1a2d)), closes [#119](https://github.com/sinnerschrader/feature-hub/issues/119) [#167](https://github.com/sinnerschrader/feature-hub/issues/167) [#189](https://github.com/sinnerschrader/feature-hub/issues/189) [#151](https://github.com/sinnerschrader/feature-hub/issues/151) [#138](https://github.com/sinnerschrader/feature-hub/issues/138) [#145](https://github.com/sinnerschrader/feature-hub/issues/145) [#146](https://github.com/sinnerschrader/feature-hub/issues/146)
* **history-service:** rename interface property and method arguments ([#227](https://github.com/sinnerschrader/feature-hub/issues/227)) ([2852fb4](https://github.com/sinnerschrader/feature-hub/commit/2852fb4))





# [0.10.0](https://github.com/sinnerschrader/feature-hub/compare/v0.9.0...v0.10.0) (2018-12-20)

**Note:** Version bump only for package @feature-hub/history-service





# [0.9.0](https://github.com/sinnerschrader/feature-hub/compare/v0.8.0...v0.9.0) (2018-12-20)


### Features

* **history-service:** remove history package type exports ([#197](https://github.com/sinnerschrader/feature-hub/issues/197)) ([1694769](https://github.com/sinnerschrader/feature-hub/commit/1694769))





# [0.8.0](https://github.com/sinnerschrader/feature-hub/compare/v0.7.0...v0.8.0) (2018-12-19)


### Bug Fixes

* **history-service:** navigation after reload ([#175](https://github.com/sinnerschrader/feature-hub/issues/175)) ([b37eecf](https://github.com/sinnerschrader/feature-hub/commit/b37eecf)), closes [#171](https://github.com/sinnerschrader/feature-hub/issues/171)





# [0.7.0](https://github.com/sinnerschrader/feature-hub/compare/v0.6.0...v0.7.0) (2018-12-14)


### Features

* **history-service:** history is now a peer dependency ([#184](https://github.com/sinnerschrader/feature-hub/issues/184)) ([92dc0f1](https://github.com/sinnerschrader/feature-hub/commit/92dc0f1)), closes [#129](https://github.com/sinnerschrader/feature-hub/issues/129)





# [0.6.0](https://github.com/sinnerschrader/feature-hub/compare/v0.5.1...v0.6.0) (2018-12-13)


### Features

* **demos:** add initial history service demo ([#178](https://github.com/sinnerschrader/feature-hub/issues/178)) ([cd9daf1](https://github.com/sinnerschrader/feature-hub/commit/cd9daf1))





## [0.5.1](https://github.com/sinnerschrader/feature-hub/compare/v0.5.0...v0.5.1) (2018-12-11)


### Bug Fixes

* **history-service:** POP to initial location and replaced locations ([#159](https://github.com/sinnerschrader/feature-hub/issues/159)) ([4dee669](https://github.com/sinnerschrader/feature-hub/commit/4dee669)), closes [#149](https://github.com/sinnerschrader/feature-hub/issues/149)





# [0.5.0](https://github.com/sinnerschrader/feature-hub/compare/v0.4.0...v0.5.0) (2018-12-11)


### Features

* **core:** separate configs for feature apps and services ([#165](https://github.com/sinnerschrader/feature-hub/issues/165)) ([bcff8fe](https://github.com/sinnerschrader/feature-hub/commit/bcff8fe)), closes [#133](https://github.com/sinnerschrader/feature-hub/issues/133)





# [0.4.0](https://github.com/sinnerschrader/feature-hub/compare/v0.3.0...v0.4.0) (2018-12-03)


### Features

* **history-service:** add history feature service ([#113](https://github.com/sinnerschrader/feature-hub/issues/113)) ([309e66d](https://github.com/sinnerschrader/feature-hub/commit/309e66d)), closes [#21](https://github.com/sinnerschrader/feature-hub/issues/21)
