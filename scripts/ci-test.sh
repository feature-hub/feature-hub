#!/bin/sh

set -e

./scripts/word-blacklist.sh

yarn commitlint-travis

yarn compile
yarn bundle
yarn generate-docs

yarn lint
yarn test --no-cache --runInBand
yarn sort-package-jsons
yarn verify
