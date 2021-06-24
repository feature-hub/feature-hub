/**
 * @jest-environment puppeteer
 */

import {Server} from 'http';
import {AddressInfo} from 'net';
import {Browser} from '../browser';
import {startServer} from '../start-server';
import webpackConfigs from './webpack-config';

jest.setTimeout(120000);

describe('integration test: "federation module loader"', () => {
  const browser = new Browser(5000);

  let server: Server;

  beforeAll(async () => {
    server = await startServer(webpackConfigs);

    const {port} = server.address() as AddressInfo;

    await browser.goto(`http://localhost:${port}`, 120000);
  });

  afterAll((done) => server.close(done));

  it('loads the Feature App with module federation', async () => {
    await expect(page).toMatch('Hello from Feature App 1!');
    await expect(page).toMatch('Hello from Feature App 2!');
  });
});
