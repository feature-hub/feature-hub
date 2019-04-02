#!/bin/sh

set -e

if [ "$TEST_SUITE" = "unit" ]
then
  ./scripts/ci/word-blacklist.sh

  yarn commitlint-travis

  yarn test:unit --no-cache --maxWorkers 2 --no-verbose
  yarn lint
  yarn compile
  yarn verify
else
  node --max_old_space_size=4096 $(npm bin)/jest --no-cache --maxWorkers 2 --no-verbose --no-coverage --logHeapUsage --testPathPattern packages/demos
fi
