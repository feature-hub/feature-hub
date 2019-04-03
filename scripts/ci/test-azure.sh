#!/bin/sh

set -e

./scripts/ci/word-blacklist.sh

yarn commitlint-azure-pipelines

yarn test:unit --no-cache --maxWorkers 2 --no-verbose
find packages/demos -iname '*test.ts*' | xargs -n 2 yarn jest --no-cache --no-verbose --no-coverage --maxWorkers 2
yarn lint
yarn compile
yarn verify
