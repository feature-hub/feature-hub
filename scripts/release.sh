#!/bin/sh

set -e

echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc

git config --global user.email "feature-hub@sinnerschrader.com"
git config --global user.name "Feature Hub CI"

git remote add writable-origin "https://${GITHUB_TOKEN}@github.com/sinnerschrader/feature-hub.git"
git fetch writable-origin
git checkout -b master --track writable-origin/master

npx lerna version --conventional-commits --yes --git-remote writable-origin
npx lerna publish from-git --yes
