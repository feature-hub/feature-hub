/**
 * @jest-environment puppeteer
 */

import {Server} from 'http';
import {AddressInfo} from 'net';
import {Browser} from '../browser';
import {startServer} from '../start-server';
import {stubConsole} from '../stub-console';
import renderApp from './integrator.node';
import webpackConfigs from './webpack-config';

jest.setTimeout(120000);

stubConsole();

describe('integration test: "Feature App in Feature App"', () => {
  const browser = new Browser(5000);

  let server: Server;
  let url: string;

  beforeAll(async () => {
    server = await startServer(webpackConfigs, renderApp);

    const {port} = server.address() as AddressInfo;

    url = `http://localhost:${port}/`;

    await browser.goto(`http://localhost:${port}`, 120000);
  });

  afterAll(done => server.close(done));

  it('loads the server-side rendered HTML of the Feature App with another nested Feature App', async () => {
    // We need to disable JavaScript for this test to ensure that the server-rendered HTML is observed.
    await page.setJavaScriptEnabled(false);
    await browser.goto(url);

    await expect(page).toMatch('Hello, World!');

    // Re-enable JavaScript to restore the default behavior for all other tests.
    await page.setJavaScriptEnabled(true);
    await browser.goto(url);
  });

  it('renders a Feature App with another nested Feature App', async () => {
    await expect(page).toMatch('Hello, World!');
  });
});
