#!/bin/sh

set -e

./scripts/ci/word-blacklist.sh

yarn commitlint-travis

yarn build
yarn lint
yarn test --no-cache --runInBand
yarn sort-package-jsons
yarn verify
