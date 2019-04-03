#!/bin/sh

set -e

./scripts/ci/word-blacklist.sh
yarn commitlint-azure-pipelines
./scripts/ci/test.sh
