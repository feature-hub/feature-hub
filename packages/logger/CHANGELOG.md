# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
