/**
 * @jest-environment puppeteer
 */

import {Server} from 'http';
import {AddressInfo} from 'net';
import {startServer} from '../start-server';
import webpackConfigs from './webpack-config';

jest.setTimeout(60000);

describe('integration test: "amd module loader"', () => {
  let server: Server;

  beforeAll(async () => {
    server = await startServer(webpackConfigs);
  });

  afterAll(done => server.close(done));

  beforeEach(async () => {
    const {port} = server.address() as AddressInfo;

    await page.goto(`http://localhost:${port}`);
  });

  it('loads the feature app with react as external', async () => {
    await expect(page).toMatch('Hello, World!');
  });
});
