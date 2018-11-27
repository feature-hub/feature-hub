#!/bin/sh

set -e

echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc

git config --global user.email "feature-hub@sinnerschrader.com"
git config --global user.name "Feature Hub CI"

git checkout master

npx lerna version --conventional-commits --yes
npx lerna publish from-git --npm-client npm --yes
