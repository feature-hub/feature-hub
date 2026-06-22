// @ts-check

const fs = require('fs');



/** @type {import('jest-environment-puppeteer').JestPuppeteerConfig} */
module.exports = {
  launch: {
    headless: 'new',
    args: ['--no-zygote', '--no-sandbox'],
  },
};
