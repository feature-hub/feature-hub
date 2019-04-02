#!/bin/sh

set -e

./scripts/ci/word-blacklist.sh

yarn commitlint-travis

yarn test:unit --no-cache --maxWorkers 2 --no-verbose
node --max_old_space_size=4096 $(npm bin)/jest --no-cache --maxWorkers 2 --no-verbose --no-coverage --logHeapUsage --testPathPattern packages/demos
yarn lint
yarn compile
yarn verify
