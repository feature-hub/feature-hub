/**
 * @jest-environment puppeteer
 */

import {Server} from 'http';
import {AddressInfo} from 'net';
import {parse} from 'url';
import {startServer} from '../start-server';
import webpackConfigs from './webpack-config';

jest.setTimeout(60000);

async function getInputValue(selector: string): Promise<string | undefined> {
  const element = await page.$(selector);

  if (!element) {
    return;
  }

  const value = await element.getProperty('value');

  return value.jsonValue();
}

describe('integration test: "history-service"', () => {
  let server: Server;
  let url: string;

  beforeAll(async () => {
    server = await startServer(webpackConfigs);

    const {port} = server.address() as AddressInfo;

    url = `http://localhost:${port}/`;
  });

  afterAll(done => server.close(done));

  test('Scenario 1: The user loads a page without consumer-specific pathnames', async () => {
    await page.goto(url);

    expect(parse(page.url()).path).toBe('/');

    expect(await getInputValue('#pathname-a')).toBe('/');
    expect(await getInputValue('#pathname-b')).toBe('/');
  });

  test('Scenario 2: The user loads a page with consumer-specific pathnames', async () => {
    await page.goto(
      `${url}?test:history-consumer:a=/a1&test:history-consumer:b=/b1`
    );

    expect(parse(page.url()).path).toBe(
      '/?test:history-consumer:a=/a1&test:history-consumer:b=/b1'
    );

    expect(await getInputValue('#pathname-a')).toBe('/a1');
    expect(await getInputValue('#pathname-b')).toBe('/b1');
  });
});