#!/bin/sh

set -e

echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc

git config --global user.email "feature-hub@sinnerschrader.com"
git config --global user.name "Feature Hub CI"

git remote update
git fetch
git checkout -b master --track origin/master

npx lerna version --conventional-commits --yes --git-remote "https://${GITHUB_TOKEN}@github.com/sinnerschrader/feature-hub.git" --no-push
# npx lerna publish from-git --yes
