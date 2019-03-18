#!/bin/sh

set -e

./scripts/ci/word-blacklist.sh

yarn commitlint --from=$TARGET_BRANCH

yarn test --no-cache --maxWorkers 2 --no-verbose
yarn lint
yarn compile
yarn verify
