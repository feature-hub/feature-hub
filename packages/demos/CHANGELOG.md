# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
