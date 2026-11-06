/**
 * @jest-environment puppeteer
 */

import {Server} from 'http';
import {AddressInfo} from 'net';
import {Browser} from '../browser';
import {startServer} from '../start-server';
import {prepare} from './prepare';

jest.setTimeout(180000);

describe('integration test: "federation module loader (Vite integrator + Vite remote)"', () => {
  const browser = new Browser(5000);

  let server: Server;

  beforeAll(async () => {
    const {staticMounts} = await prepare();

    server = await startServer([], undefined, undefined, staticMounts);

    const {port} = server.address() as AddressInfo;

    await browser.goto(`http://localhost:${port}`, 120000);
  });

  afterAll((done) => {
    server.close(done);
  });

  it('loads the Feature Apps with module federation', async () => {
    await Promise.all([
      page.waitForSelector('::-p-text(Hello from Vite Feature App 1!)'),
      page.waitForSelector('::-p-text(Hello from Vite Feature App 2!)'),
      // From a second remote built with the same name as the first.
      page.waitForSelector('::-p-text(Hello from Vite Feature App 3!)'),
    ]);
  });
});
