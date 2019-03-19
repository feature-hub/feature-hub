#!/bin/sh

set -e

./scripts/ci/word-blacklist.sh

yarn commitlint-azure-pipelines

yarn test --no-cache --maxWorkers 2 --no-verbose
yarn lint
yarn compile
yarn verify
