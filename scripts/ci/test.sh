#!/bin/sh

set -e

./scripts/ci/word-blacklist.sh

yarn commitlint-travis

yarn compile
yarn lint
yarn test --no-cache --maxWorkers 2 --no-verbose
yarn verify
