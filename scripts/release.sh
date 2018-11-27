#!/bin/sh

set -e

echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc

git config --global user.email "feature-hub@sinnerschrader.com"
git config --global user.name "Feature Hub CI"

git remote add writable-origin "https://${GITHUB_TOKEN}@github.com/sinnerschrader/feature-hub.git"

npx lerna version --conventional-commits --yes --git-remote writable-origin
npx lerna publish from-git --yes
