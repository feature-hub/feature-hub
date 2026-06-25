// @ts-check

// biome-ignore lint: test harness loads the puppeteer config via Node.js
const fs = require('fs');

/** @type {import('jest-environment-puppeteer').JestPuppeteerConfig} */
module.exports = {
  launch: {
    headless: 'new',
    args: ['--no-zygote', '--no-sandbox'],
  },
};
