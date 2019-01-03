# Feature Hub

[![Build Status][travis-ci-badge]][travis-ci]
[![Website][website-badge]][website]

The Feature Hub is an opinionated JavaScript implementation of the micro
frontends approach to creating scalable web applications with multiple teams and
different technologies.

**Note:** This software is in active development and is subject to potentially
breaking changes. It is not yet used in production. The currently planned
milestones can be viewed [here][milestones].

## Contributing

The main purpose of this monorepo is to further develop the Feature Hub. It is
developed in the open on GitHub, and we are grateful to the community for
contributing bugfixes and improvements.

To get started, install the dependencies and run the tests:

```sh
yarn && yarn test
```

### Code of Conduct

Please note that this project is released with a [Contributor Code of
Conduct][code-of-conduct]. By participating in this project you agree to abide
by its terms.

### Development Scripts

- `yarn watch:test` — Watches all tests.
- `yarn watch:demo <demo-name>` — Watches the given
  [demo][demos-package-getting-started].
- `yarn watch:compile` — Watches all sources.
- `yarn watch:website` — Watches the website.
- `yarn test` — Executes all tests.
- `yarn compile` — Compiles all sources.
- `yarn lint` — Lints all sources.
- `yarn verify` — Verifies non-functional requirements (used on CI).
- `yarn format` — Formats all files.
- `yarn sort-package-jsons` — Sorts all `package.json` files.

### Publishing a New Release

Instead of letting the CI automatically publish on every master merge, the
Feature Hub package releases are triggered manually.

To create a new semantic npm release for all Feature Hub packages, core team
members must trigger a custom [Travis CI][travis-ci] build on the `master`
branch. You should leave the custom config and commit message fields empty.

---

Copyright (c) 2018-2019 SinnerSchrader Deutschland GmbH. Released under the
terms of the [MIT License][license].

[code-of-conduct]:
  https://github.com/sinnerschrader/feature-hub/blob/master/CODE_OF_CONDUCT.md
[demos-package-getting-started]:
  https://github.com/sinnerschrader/feature-hub/tree/master/packages/demos#getting-started
[license]: https://github.com/sinnerschrader/feature-hub/blob/master/LICENSE
[milestones]: https://github.com/sinnerschrader/feature-hub/milestones
[travis-ci]: https://travis-ci.com/sinnerschrader/feature-hub
[travis-ci-badge]:
  https://travis-ci.com/sinnerschrader/feature-hub.svg?branch=master
[website]: https://feature-hub.io/
[website-badge]:
  https://img.shields.io/badge/Website-Feature%20Hub-%234502da.svg
