/**
 * @jest-environment puppeteer
 */

import {Server} from 'http';
import {AddressInfo} from 'net';
import {ConsoleMessage} from 'puppeteer';
import {Browser} from '../browser';
import {startServer} from '../start-server';
import {stubConsole} from '../stub-console';
import webpackConfigs from './webpack-config';

jest.setTimeout(120000);

stubConsole();

describe('integration test: "custom logging"', () => {
  const browser = new Browser(5000);

  let server: Server;
  let consoleMessages: ConsoleMessage[];

  beforeAll(async () => {
    server = await startServer(webpackConfigs, undefined);
    consoleMessages = [];

    page.on('console', consoleMessages.push.bind(consoleMessages));

    const {port} = server.address() as AddressInfo;

    await browser.goto(`http://localhost:${port}`, 120000);
  });

  afterAll(done => server.close(done));

  it('logs with the custom logger', async () => {
    const messages = await Promise.all(
      consoleMessages.map(async consoleMessage =>
        Promise.all(
          consoleMessage.args().map(async handle => handle.jsonValue())
        )
      )
    );

    expect(messages).toContainEqual([
      '%ctest:integrator',
      'font-weight: bold',
      'Creating Feature App "test:logging-app:first"...'
    ]);

    expect(messages).toContainEqual([
      '%ctest:integrator',
      'font-weight: bold',
      'Creating Feature App "test:logging-app:second"...'
    ]);
  });
});
