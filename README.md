# Feature Hub

The **Feature Hub** is an opinionated JavaScript implementation of the micro
frontends approach to creating scalable web applications with multiple teams and
different technologies.

## Documentation

For more information, please refer to the [documentation][documentation].

## Contributing

The main purpose of this monorepo is to further develop the Feature Hub. It is
developed in the open on GitHub, and we are grateful to the community for
contributing bugfixes and improvements.

To get started, install the dependencies and run the tests:

```sh
npm install
npm run test
```

### Code of Conduct

Please note that this project is released with a [Contributor Code of
Conduct][code-of-conduct]. By participating in this project you agree to abide
by its terms.

### Development Scripts

- `npm run watch:test` — Watches all tests.
  - `npm run watch:test:unit` — Watches only unit tests.
  - `npm run watch:test:integration` — Watches only integration tests.
- `npm run watch:compile` — Watches all sources.
- `npm run watch:demo -- <demo-name>` — Watches the given
  [demo][demos-package-getting-started].
- `npm run watch:website` — Watches the website.
- `npm test` — Executes all tests.
- `npm run compile` — Compiles all sources.
- `npm run lint` — Lints all sources.
- `npm run verify` — Verifies non-functional requirements (used on CI).
- `npm run format` — Formats all files.
- `npm run sort-package-jsons` — Sorts all `package.json` files.

### Publishing a New Release

Instead of letting the CI automatically publish on every main merge, the Feature
Hub package releases are triggered manually. To create a new semantic npm
release for all Feature Hub packages, core team members must trigger a [Release
Workflow][release-workflow] on the `main` branch.

---

Copyright (c) 2018-2026 Accenture Song Build Germany GmbH. Released under the
terms of the [MIT License][license].

[code-of-conduct]:
  https://github.com/feature-hub/feature-hub/blob/main/CODE_OF_CONDUCT.md
[demos-package-getting-started]:
  https://github.com/feature-hub/feature-hub/tree/main/packages/demos#getting-started
[documentation]: https://feature-hub.io/docs/getting-started/introduction.html
[license]: https://github.com/feature-hub/feature-hub/blob/main/LICENSE
[release-workflow]:
  https://github.com/feature-hub/feature-hub/actions/workflows/release.yml
