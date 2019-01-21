/**
 * @jest-environment puppeteer
 */

import {Server} from 'http';
import {AddressInfo} from 'net';
import {Browser} from '../browser';
import {startServer} from '../start-server';
import renderMainHtml from './integrator.node';
import webpackConfigs from './webpack-config';

jest.setTimeout(60000);

class HistoryConsumerUI {
  public constructor(private readonly specifier: 'a' | 'b') {}

  public async getPathname(): Promise<string> {
    // tslint:disable-next-line:no-non-null-assertion
    const pathnameInput = (await page.$(`#pathname-${this.specifier}`))!;
    const value = await pathnameInput.getProperty('value');

    return value.jsonValue();
  }
}

describe('integration test: "history-service with server-request"', () => {
  const browser = new Browser(5000);
  const a = new HistoryConsumerUI('a');
  const b = new HistoryConsumerUI('b');

  let server: Server;
  let url: string;

  beforeAll(async () => {
    server = await startServer(webpackConfigs, renderMainHtml);

    const {port} = server.address() as AddressInfo;

    url = `http://localhost:${port}/`;

    // Trigger initial webpack DEV build
    await browser.goto(url, 60000);
  });

  afterAll(done => server.close(done));

  it('loads the server-side rendered Feature Apps using the correct consumer paths', async () => {
    await browser.goto(
      `${url}?test:history-consumer:a=/a1&test:history-consumer:b=/b1`
    );

    expect(await a.getPathname()).toBe('/a1');
    expect(await b.getPathname()).toBe('/b1');
  });
});
