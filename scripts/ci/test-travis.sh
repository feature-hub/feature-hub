#!/bin/sh

set -e

if [ "$TEST_SUITE" = "unit" ]
then
  ./scripts/ci/word-blacklist.sh

  yarn commitlint-travis

  yarn test:$TEST_SUITE --no-cache --maxWorkers 2 --no-verbose
  yarn lint
  yarn compile
  yarn verify
else
  yarn test:$TEST_SUITE --no-cache --runInBand --logHeapUsage --no-verbose
fi
