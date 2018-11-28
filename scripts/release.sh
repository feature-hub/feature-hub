#!/bin/sh

set -e

git checkout master

npx lerna version --conventional-commits --yes
npx lerna publish from-git --npm-client npm --yes
