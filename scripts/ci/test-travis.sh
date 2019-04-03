#!/bin/sh

set -e

./scripts/ci/word-blacklist.sh
yarn commitlint-travis
./scripts/ci/test.sh
