#!/bin/sh

set -e

$(npm bin)/lerna exec --scope @feature-hub/website -- rm -rf build
$(npm bin)/lerna exec --scope @feature-hub/website -- docusaurus-build
$(npm bin)/typedoc --options typedoc.js .
node scripts/process-api-docs.js
$(npm bin)/lerna run --scope @feature-hub/demos build:todomvc
