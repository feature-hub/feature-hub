// @ts-check

require('expect-puppeteer');

const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
const url = require('url');

Enzyme.configure({adapter: new Adapter()});

// @ts-ignore
global.URLSearchParams = url.URLSearchParams;
