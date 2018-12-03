#!/bin/sh

set -e

./scripts/ci/word-blacklist.sh

yarn commitlint-travis

yarn build
yarn generate-docs
yarn lint
yarn test --no-cache --runInBand
yarn verify
