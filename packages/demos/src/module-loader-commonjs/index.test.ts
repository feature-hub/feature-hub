/**
 * @jest-environment puppeteer
 */

import {Server} from 'http';
import {AddressInfo} from 'net';
import {Browser} from '../browser';
import {startServer} from '../start-server';
import webpackConfigs from './webpack-config';
import nodeIntegratorWebpackConfig from './webpack-config.node';

jest.setTimeout(120000);

describe('integration test: "commonjs module loader"', () => {
  const browser = new Browser(5000);

  let server: Server;

  beforeAll(async () => {
    server = await startServer(webpackConfigs, nodeIntegratorWebpackConfig);

    const {port} = server.address() as AddressInfo;

    await browser.goto(`http://localhost:${port}`, 120000);
  });

  afterAll((done) => server.close(done));

  it('loads the server-side rendered Feature App HTML', async () => {
    await expect(page).toMatch('Hello, World!');
  });
});
