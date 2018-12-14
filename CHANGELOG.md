# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
