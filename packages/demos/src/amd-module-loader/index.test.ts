/**
 * @jest-environment puppeteer
 */

import {Server} from 'http';
import {AddressInfo} from 'net';
import {Browser} from '../browser';
import {startServer} from '../start-server';
import webpackConfigs from './webpack-config';

jest.setTimeout(60000);

describe('integration test: "amd module loader"', () => {
  const browser = new Browser(5000);

  let server: Server;

  beforeAll(async () => {
    server = await startServer(webpackConfigs);

    const {port} = server.address() as AddressInfo;

    await browser.goto(`http://localhost:${port}`, 60000);
  });

  afterAll(done => server.close(done));

  it('loads the feature app with react as external', async () => {
    await expect(page).toMatch('Hello, World!');
  });
});
