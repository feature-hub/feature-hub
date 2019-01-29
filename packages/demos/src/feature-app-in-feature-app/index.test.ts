/**
 * @jest-environment puppeteer
 */

import {Server} from 'http';
import {AddressInfo} from 'net';
import {Browser} from '../browser';
import {startServer} from '../start-server';
import webpackConfigs from './webpack-config';

jest.setTimeout(60000);

describe('integration test: "Feature App in Feature App"', () => {
  const browser = new Browser(5000);

  let server: Server;

  beforeAll(async () => {
    server = await startServer(webpackConfigs, undefined);

    const {port} = server.address() as AddressInfo;

    await browser.goto(`http://localhost:${port}`, 60000);
  });

  afterAll(done => server.close(done));

  it('renders a Feature App with another nested Feature App', async () => {
    await expect(page).toMatch('Hello, World!');
  });
});
