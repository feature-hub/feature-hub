#!/bin/sh

set -e

./scripts/ci/word-blacklist.sh

yarn commitlint-travis

yarn verify
yarn test --no-cache --maxWorkers 2 --no-verbose
yarn lint
yarn compile
