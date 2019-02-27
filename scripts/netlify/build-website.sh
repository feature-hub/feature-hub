#!/bin/sh

set -e

yarn
$(npm bin)/lerna exec --scope @feature-hub/website -- rm -rf build
$(npm bin)/lerna exec --scope @feature-hub/website -- docusaurus-build
$(npm bin)/lerna exec --no-private --parallel -- typedoc --options ../../typedoc.js --out ../../packages/website/build/feature-hub/\$LERNA_PACKAGE_NAME --tsconfig tsconfig.json .
node scripts/netlify/process-api-docs.js
$(npm bin)/lerna run --scope @feature-hub/demos build:todomvc
