// @ts-check

const fs = require('fs');

const macChromePaths = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
];

const executablePath = macChromePaths.find((path) => fs.existsSync(path));

/** @type {import('jest-environment-puppeteer').JestPuppeteerConfig} */
module.exports = {
  launch: {
    ...(executablePath ? {executablePath} : {}),
    headless: 'new',
    args: ['--no-zygote', '--no-sandbox'],
  },
};
