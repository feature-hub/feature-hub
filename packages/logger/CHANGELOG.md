# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [3.0.0](https://github.com/sinnerschrader/feature-hub/compare/v2.13.1...v3.0.0) (2022-09-20)

**Note:** Version bump only for package @feature-hub/logger





# [2.13.0](https://github.com/sinnerschrader/feature-hub/compare/v2.12.0...v2.13.0) (2022-04-04)

**Note:** Version bump only for package @feature-hub/logger





## [2.11.1](https://github.com/sinnerschrader/feature-hub/compare/v2.11.0...v2.11.1) (2022-02-10)

**Note:** Version bump only for package @feature-hub/logger





# [2.11.0](https://github.com/sinnerschrader/feature-hub/compare/v2.10.0...v2.11.0) (2022-02-10)

**Note:** Version bump only for package @feature-hub/logger





# [2.9.0](https://github.com/sinnerschrader/feature-hub/compare/v2.8.1...v2.9.0) (2021-07-12)

**Note:** Version bump only for package @feature-hub/logger





## [2.8.1](https://github.com/sinnerschrader/feature-hub/compare/v2.8.0...v2.8.1) (2020-11-14)

**Note:** Version bump only for package @feature-hub/logger





# [2.8.0](https://github.com/sinnerschrader/feature-hub/compare/v2.7.0...v2.8.0) (2020-10-27)


### Features

* **all:** pass featureAppName as consumerName to Feature Service binder ([#589](https://github.com/sinnerschrader/feature-hub/issues/589)) ([44b019f](https://github.com/sinnerschrader/feature-hub/commit/44b019f))





# [2.7.0](https://github.com/sinnerschrader/feature-hub/compare/v2.6.0...v2.7.0) (2020-06-11)


### Features

* **core:** allow returning undefined in feature service's create method ([#587](https://github.com/sinnerschrader/feature-hub/issues/587)) ([ae53268](https://github.com/sinnerschrader/feature-hub/commit/ae53268)), closes [#582](https://github.com/sinnerschrader/feature-hub/issues/582)





## [2.4.1](https://github.com/sinnerschrader/feature-hub/compare/v2.4.0...v2.4.1) (2020-02-12)

**Note:** Version bump only for package @feature-hub/logger





# [2.4.0](https://github.com/sinnerschrader/feature-hub/compare/v2.3.1...v2.4.0) (2019-12-18)

**Note:** Version bump only for package @feature-hub/logger





## [2.3.1](https://github.com/sinnerschrader/feature-hub/compare/v2.3.0...v2.3.1) (2019-11-01)

**Note:** Version bump only for package @feature-hub/logger





# [2.2.0](https://github.com/sinnerschrader/feature-hub/compare/v2.1.1...v2.2.0) (2019-07-11)

**Note:** Version bump only for package @feature-hub/logger





## [2.1.1](https://github.com/sinnerschrader/feature-hub/compare/v2.1.0...v2.1.1) (2019-07-06)

**Note:** Version bump only for package @feature-hub/logger





# [2.0.0](https://github.com/sinnerschrader/feature-hub/compare/v1.7.0...v2.0.0) (2019-06-20)


### Features

* **core:** remove ability to provide configs via FeatureServiceRegistry ([#500](https://github.com/sinnerschrader/feature-hub/issues/500)) ([388b9f0](https://github.com/sinnerschrader/feature-hub/commit/388b9f0))


### BREAKING CHANGES

* **core:** The option `featureServiceConfigs` has been removed
from the options of `createFeatureHub` and from the options of the
`FeatureServiceRegistry` constructor. The `env` that is passed to a
Feature Service's `create` method does not include a `config` property
anymore. If a Feature Service must be configured, a factory function
that accepts options, and that returns a Feature Service definition,
should be used instead, see `@feature-hub/async-ssr-manager` for an
example.





# [1.7.0](https://github.com/sinnerschrader/feature-hub/compare/v1.6.0...v1.7.0) (2019-05-10)

**Note:** Version bump only for package @feature-hub/logger





# [1.5.0](https://github.com/sinnerschrader/feature-hub/compare/v1.4.0...v1.5.0) (2019-04-16)

**Note:** Version bump only for package @feature-hub/logger





# [1.4.0](https://github.com/sinnerschrader/feature-hub/compare/v1.3.0...v1.4.0) (2019-04-08)

**Note:** Version bump only for package @feature-hub/logger





# [1.3.0](https://github.com/sinnerschrader/feature-hub/compare/v1.2.0...v1.3.0) (2019-03-15)


### Features

* **logger:** add Logger Feature Service ([#413](https://github.com/sinnerschrader/feature-hub/issues/413)) ([97d5f3e](https://github.com/sinnerschrader/feature-hub/commit/97d5f3e))
