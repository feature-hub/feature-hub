/**
 * @jest-environment puppeteer
 */

// tslint:disable:no-non-null-assertion

import {Server} from 'http';
import {AddressInfo} from 'net';
import {ElementHandle} from 'puppeteer';
import {parse} from 'url';
import {startServer} from '../start-server';
import webpackConfigs from './webpack-config';

jest.setTimeout(60000);

class HistoryConsumerUI {
  public static readonly a = new HistoryConsumerUI('a');
  public static readonly b = new HistoryConsumerUI('b');

  private constructor(private readonly prefix: 'a' | 'b') {}

  public async getPathname(): Promise<string> {
    const pathnameInput = await this.getPathnameInput();

    const value = await pathnameInput.getProperty('value');

    return value.jsonValue();
  }

  public async push(pathname: string): Promise<void> {
    await (await this.getNewPathnameInput()).type(pathname);
    await (await this.getPushButton()).click();
  }

  public async replace(pathname: string): Promise<void> {
    await (await this.getNewPathnameInput()).type(pathname);
    await (await this.getReplaceButton()).click();
  }

  private async getNewPathnameInput(): Promise<
    ElementHandle<HTMLInputElement>
  > {
    return (await page.$(`#new-pathname-${this.prefix}`))!;
  }

  private async getPathnameInput(): Promise<ElementHandle<HTMLInputElement>> {
    return (await page.$(`#pathname-${this.prefix}`))!;
  }

  private async getPushButton(): Promise<ElementHandle<HTMLButtonElement>> {
    return (await page.$(`#push-${this.prefix}`))!;
  }

  private async getReplaceButton(): Promise<ElementHandle<HTMLButtonElement>> {
    return (await page.$(`#replace-${this.prefix}`))!;
  }
}

async function getRootPath(): Promise<string> {
  return decodeURIComponent(
    parse(await page.evaluate('location.href')).path || ''
  );
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

    expect(await getRootPath()).toBe('/');

    expect(await HistoryConsumerUI.a.getPathname()).toBe('/');
    expect(await HistoryConsumerUI.b.getPathname()).toBe('/');
  });

  test('Scenario 2: The user loads a page with consumer-specific pathnames', async () => {
    await page.goto(
      `${url}?test:history-consumer:a=/a1&test:history-consumer:b=/b1`
    );

    expect(await getRootPath()).toBe(
      '/?test:history-consumer:a=/a1&test:history-consumer:b=/b1'
    );

    expect(await HistoryConsumerUI.a.getPathname()).toBe('/a1');
    expect(await HistoryConsumerUI.b.getPathname()).toBe('/b1');
  });

  test('Scenario 3: Consumer A pushes a new pathname', async () => {
    await page.goto(url);

    expect(await getRootPath()).toBe('/');

    await HistoryConsumerUI.a.push('/a1');

    expect(await getRootPath()).toBe('/?test:history-consumer:a=/a1');

    expect(await HistoryConsumerUI.a.getPathname()).toBe('/a1');
    expect(await HistoryConsumerUI.b.getPathname()).toBe('/');
  });

  test('Scenario 4: Consumer A pushes a new pathname and then the user navigates back', async () => {
    await page.goto(url);
    await HistoryConsumerUI.a.push('/a1');
    await page.goBack();

    expect(await getRootPath()).toBe('/');

    expect(await HistoryConsumerUI.a.getPathname()).toBe('/');
    expect(await HistoryConsumerUI.b.getPathname()).toBe('/');
  });

  test('Scenario 5: Consumer A pushes a new pathname and then the user navigates back and forward', async () => {
    await page.goto(url);

    expect(await getRootPath()).toBe('/');

    await HistoryConsumerUI.a.push('/a1');
    await page.goBack();
    await page.goForward();

    expect(await getRootPath()).toBe('/?test:history-consumer:a=/a1');

    expect(await HistoryConsumerUI.a.getPathname()).toBe('/a1');
    expect(await HistoryConsumerUI.b.getPathname()).toBe('/');
  });

  test('Scenario 6: Consumer A and B both push new pathnames', async () => {
    await page.goto(url);

    expect(await getRootPath()).toBe('/');

    await HistoryConsumerUI.a.push('/a1');
    await HistoryConsumerUI.b.push('/b1');

    expect(await getRootPath()).toBe(
      '/?test:history-consumer:a=/a1&test:history-consumer:b=/b1'
    );

    expect(await HistoryConsumerUI.a.getPathname()).toBe('/a1');
    expect(await HistoryConsumerUI.b.getPathname()).toBe('/b1');
  });

  test.skip('Scenario 7: Consumer A pushes a new pathname, B replaces their pathname, and then the user navigates back', async () => {
    await page.goto(url);

    expect(await getRootPath()).toBe('/');

    await HistoryConsumerUI.a.push('/a1');
    await HistoryConsumerUI.b.replace('/b1');
    await page.goBack();

    expect(await getRootPath()).toBe(
      '/?test:history-consumer:a=/&test:history-consumer:b=/b1'
    );

    expect(await HistoryConsumerUI.a.getPathname()).toBe('/');
    expect(await HistoryConsumerUI.b.getPathname()).toBe('/b1');
  });

  test('Scenario 8: Consumer A pushes a new pathname two times, then the user navigates back two times, and consumer B pushes a new pathname', async () => {
    await page.goto(url);

    expect(await getRootPath()).toBe('/');

    await HistoryConsumerUI.a.push('/a1');
    await HistoryConsumerUI.a.push('/a2');
    await page.goBack();
    await page.goBack();
    await HistoryConsumerUI.b.push('/b1');

    expect(await getRootPath()).toBe('/?test:history-consumer:b=/b1');

    expect(await HistoryConsumerUI.a.getPathname()).toBe('/');
    expect(await HistoryConsumerUI.b.getPathname()).toBe('/b1');
  });

  test('Scenario 9: Consumer A pushes a new pathname two times, then the user reloads the page, and navigates back', async () => {
    await page.goto(url);
    await HistoryConsumerUI.a.push('/a1');
    await HistoryConsumerUI.a.push('/a2');
    await page.reload();
    await page.goBack();

    expect(await getRootPath()).toBe('/?test:history-consumer:a=/a1');

    expect(await HistoryConsumerUI.a.getPathname()).toBe('/a1');
    expect(await HistoryConsumerUI.b.getPathname()).toBe('/');
  });
});
