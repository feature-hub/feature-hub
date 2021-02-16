/**
 * @jest-environment puppeteer
 */

import {Server} from 'http';
import {AddressInfo} from 'net';
import {Page} from 'puppeteer';
import {Browser} from '../browser';
import {startServer} from '../start-server';
import webpackConfigs from './webpack-config';

jest.setTimeout(120000);

describe('integration test: "dom integrator"', () => {
  const browser = new Browser(5000);

  let server: Server;
  let url: string;

  beforeAll(async () => {
    server = await startServer(webpackConfigs);
    const {port} = server.address() as AddressInfo;
    url = `http://localhost:${port}`;

    await browser.goto(url, 120000);
  });

  afterAll((done) => server.close(done));

  describe('if the Feature App loads successfully', () => {
    it('renders the Feature App', async () => {
      const handle = await page.evaluateHandle(
        'document.querySelector("feature-app-loader").shadowRoot.querySelector("feature-app-container").shadowRoot'
      );

      await expect(handle).toMatch('Hello, World!');
    });
  });

  describe('if the Feature App fails to load', () => {
    let interceptedPage: Page;

    beforeAll(async () => {
      interceptedPage = await browser.newPage();

      await interceptedPage.setRequestInterception(true);

      interceptedPage.on('request', async (request) => {
        if (request.url().endsWith('feature-app.umd.js')) {
          await request.abort();
        } else {
          await request.continue();
        }
      });

      await interceptedPage.goto(url);
    });

    it('renders an error slot', async () => {
      const slotName = await interceptedPage.evaluate(
        'document.querySelector("feature-app-loader").shadowRoot.querySelector("slot").name'
      );

      expect(slotName).toBe('error');
    });
  });

  describe('while the Feature App loads', () => {
    let interceptedPage: Page;

    beforeAll(async () => {
      interceptedPage = await browser.newPage();

      await interceptedPage.setRequestInterception(true);

      interceptedPage.on('request', async (request) => {
        if (!request.url().endsWith('feature-app.umd.js')) {
          await request.continue();
        }
      });

      await interceptedPage.goto(url, {waitUntil: 'domcontentloaded'});
    });

    it('renders a loading slot', async () => {
      const slotName = await interceptedPage.evaluate(
        'document.querySelector("feature-app-loader").shadowRoot.querySelector("slot").name'
      );

      expect(slotName).toBe('loading');
    });
  });
});
