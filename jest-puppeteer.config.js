// @ts-check

/** @type {import('jest-environment-puppeteer').JestPuppeteerConfig} */
module.exports = {
  launch: {
    headless: 'new',
    args: ['--no-zygote', '--no-sandbox'],
  },
};
