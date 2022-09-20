# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.0.0](https://github.com/sinnerschrader/feature-hub/compare/v2.13.1...v3.0.0) (2022-09-20)

**Note:** Version bump only for package @feature-hub/serialized-state-manager





# [2.13.0](https://github.com/sinnerschrader/feature-hub/compare/v2.12.0...v2.13.0) (2022-04-04)

**Note:** Version bump only for package @feature-hub/serialized-state-manager





# [2.12.0](https://github.com/sinnerschrader/feature-hub/compare/v2.11.1...v2.12.0) (2022-03-31)


### Features

* **serialized-state-manager:** introduce a definition factory function ([ce6ecbb](https://github.com/sinnerschrader/feature-hub/commit/ce6ecbba04c9cac82adba4e355511cdd43c8323f))





## [2.11.1](https://github.com/sinnerschrader/feature-hub/compare/v2.11.0...v2.11.1) (2022-02-10)

**Note:** Version bump only for package @feature-hub/serialized-state-manager





# [2.11.0](https://github.com/sinnerschrader/feature-hub/compare/v2.10.0...v2.11.0) (2022-02-10)

**Note:** Version bump only for package @feature-hub/serialized-state-manager





# [2.9.0](https://github.com/sinnerschrader/feature-hub/compare/v2.8.1...v2.9.0) (2021-07-12)

**Note:** Version bump only for package @feature-hub/serialized-state-manager





## [2.8.1](https://github.com/sinnerschrader/feature-hub/compare/v2.8.0...v2.8.1) (2020-11-14)

**Note:** Version bump only for package @feature-hub/serialized-state-manager





# [2.8.0](https://github.com/sinnerschrader/feature-hub/compare/v2.7.0...v2.8.0) (2020-10-27)

**Note:** Version bump only for package @feature-hub/serialized-state-manager





# [2.7.0](https://github.com/sinnerschrader/feature-hub/compare/v2.6.0...v2.7.0) (2020-06-11)


### Features

* **core:** allow returning undefined in feature service's create method ([#587](https://github.com/sinnerschrader/feature-hub/issues/587)) ([ae53268](https://github.com/sinnerschrader/feature-hub/commit/ae53268)), closes [#582](https://github.com/sinnerschrader/feature-hub/issues/582)





## [2.4.1](https://github.com/sinnerschrader/feature-hub/compare/v2.4.0...v2.4.1) (2020-02-12)

**Note:** Version bump only for package @feature-hub/serialized-state-manager





# [2.4.0](https://github.com/sinnerschrader/feature-hub/compare/v2.3.1...v2.4.0) (2019-12-18)

**Note:** Version bump only for package @feature-hub/serialized-state-manager





## [2.3.1](https://github.com/sinnerschrader/feature-hub/compare/v2.3.0...v2.3.1) (2019-11-01)

**Note:** Version bump only for package @feature-hub/serialized-state-manager





# [2.2.0](https://github.com/sinnerschrader/feature-hub/compare/v2.1.1...v2.2.0) (2019-07-11)

**Note:** Version bump only for package @feature-hub/serialized-state-manager





## [2.1.1](https://github.com/sinnerschrader/feature-hub/compare/v2.1.0...v2.1.1) (2019-07-06)

**Note:** Version bump only for package @feature-hub/serialized-state-manager





# [2.0.0](https://github.com/sinnerschrader/feature-hub/compare/v1.7.0...v2.0.0) (2019-06-20)


### Bug Fixes

* **all:** remove all deprecated interfaces ([#510](https://github.com/sinnerschrader/feature-hub/issues/510)) ([7df042e](https://github.com/sinnerschrader/feature-hub/commit/7df042e))


### Features

* **core:** remove ability to provide configs via FeatureServiceRegistry ([#500](https://github.com/sinnerschrader/feature-hub/issues/500)) ([388b9f0](https://github.com/sinnerschrader/feature-hub/commit/388b9f0))


### BREAKING CHANGES

* **all:** The following interfaces have been removed:
- AsyncSsrManagerV0
- ExternalsValidatorLike
- FeatureAppManagerLike
- FeatureServiceRegistryLike
- HistoryServiceV0
- FeatureHubContextValue
- SerializedStateManagerV0
- ServerRequestV0
* **core:** The option `featureServiceConfigs` has been removed
from the options of `createFeatureHub` and from the options of the
`FeatureServiceRegistry` constructor. The `env` that is passed to a
Feature Service's `create` method does not include a `config` property
anymore. If a Feature Service must be configured, a factory function
that accepts options, and that returns a Feature Service definition,
should be used instead, see `@feature-hub/async-ssr-manager` for an
example.





# [1.7.0](https://github.com/sinnerschrader/feature-hub/compare/v1.6.0...v1.7.0) (2019-05-10)

**Note:** Version bump only for package @feature-hub/serialized-state-manager





# [1.5.0](https://github.com/sinnerschrader/feature-hub/compare/v1.4.0...v1.5.0) (2019-04-16)

**Note:** Version bump only for package @feature-hub/serialized-state-manager





# [1.4.0](https://github.com/sinnerschrader/feature-hub/compare/v1.3.0...v1.4.0) (2019-04-08)

**Note:** Version bump only for package @feature-hub/serialized-state-manager





# [1.3.0](https://github.com/sinnerschrader/feature-hub/compare/v1.2.0...v1.3.0) (2019-03-15)

**Note:** Version bump only for package @feature-hub/serialized-state-manager





# [1.1.0](https://github.com/sinnerschrader/feature-hub/compare/v1.0.1...v1.1.0) (2019-02-25)


### Bug Fixes

* **all:** add missing sideEffects package.json entries ([#377](https://github.com/sinnerschrader/feature-hub/issues/377)) ([e3dbc78](https://github.com/sinnerschrader/feature-hub/commit/e3dbc78))
* **all:** correct interfaces of all Feature Services to reflect the switch to version 1.0.0 ([#378](https://github.com/sinnerschrader/feature-hub/issues/378)) ([da1066c](https://github.com/sinnerschrader/feature-hub/commit/da1066c))





## [1.0.1](https://github.com/sinnerschrader/feature-hub/compare/v1.0.0...v1.0.1) (2019-02-15)


### Bug Fixes

* **all:** increase feature service versions ([#366](https://github.com/sinnerschrader/feature-hub/issues/366)) ([168c771](https://github.com/sinnerschrader/feature-hub/commit/168c771))





# [1.0.0](https://github.com/sinnerschrader/feature-hub/compare/v0.13.0...v1.0.0) (2019-02-14)

**Note:** Version bump only for package @feature-hub/serialized-state-manager





# 0.13.0 (2019-02-07)


### Features

* **all:** enforce valid semver versions for Feature Services ([#330](https://github.com/sinnerschrader/feature-hub/issues/330)) ([6cc19c6](https://github.com/sinnerschrader/feature-hub/commit/6cc19c6))
* **serialized-state-manager:** create package ([#287](https://github.com/sinnerschrader/feature-hub/issues/287)) ([8cadcb9](https://github.com/sinnerschrader/feature-hub/commit/8cadcb9))
* **serialized-state-manager:** implement public API and add JSDoc ([#290](https://github.com/sinnerschrader/feature-hub/issues/290)) ([938c8bc](https://github.com/sinnerschrader/feature-hub/commit/938c8bc))
