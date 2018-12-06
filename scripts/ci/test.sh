#!/bin/sh

set -e

./scripts/ci/word-blacklist.sh

yarn commitlint-travis

yarn compile
yarn lint
yarn test --no-cache --runInBand --detectOpenHandles
yarn verify
