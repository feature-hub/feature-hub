#!/bin/sh

set -e

yarn lerna exec --scope @feature-hub/website 'rm -rf build'
yarn lerna exec --scope @feature-hub/website 'docusaurus-build'
yarn run generate:api-docs
yarn lerna run --scope @feature-hub/demos build:todomvc
