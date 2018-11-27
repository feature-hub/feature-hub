#!/bin/sh

set -e

echo "//registry.npmjs.org/:_authToken=\${NPM_TOKEN}" > .npmrc

git config --global user.email "feature-hub@sinnerschrader.com"
git config --global user.name "Feature Hub CI"

git reset --hard HEAD~1
npx lerna version --conventional-commits --yes
git push "https://${GITHUB_TOKEN}@github.com/sinnerschrader/feature-hub.git" HEAD:master --follow-tags
npx lerna publish from-git --yes
