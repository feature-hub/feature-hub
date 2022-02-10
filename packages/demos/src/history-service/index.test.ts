/**
 * @jest-environment puppeteer
 */

import {Server} from 'http';
import {AddressInfo} from 'net';
import {ElementHandle} from 'puppeteer';
import {Browser} from '../browser';
import {startServer} from '../start-server';
import webpackConfigs from './webpack-config';
import nodeIntegratorWebpackConfig from './webpack-config.node';

jest.setTimeout(120000);

class HistoryConsumerUi {
  public constructor(
    private readonly browser: Browser,
    private readonly specifier: 'a' | 'b'
  ) {}

  public async getPathname(): Promise<string> {
    const pathnameInput = await this.getElement('pathname-input');
    const value = await pathnameInput.getProperty('value');

    return value.jsonValue();
  }

  public async push(pathname: string): Promise<void> {
    await (await this.getElement('new-path-input')).type(pathname);

    await this.browser.waitForNavigation(
      (await this.getElement('push-button')).click()
    );
  }

  public async replace(pathname: string): Promise<void> {
    await (await this.getElement('new-path-input')).type(pathname);

    await this.browser.waitForNavigation(
      (await this.getElement('replace-button')).click()
    );
  }

  public async clickPushLink(): Promise<void> {
    await this.browser.waitForNavigation(
      (await this.getElement('push-link')).click()
    );
  }

  public async clickReplaceLink(): Promise<void> {
    await this.browser.waitForNavigation(
      (await this.getElement('replace-link')).click()
    );
  }

  private async getElement(
    prefix: 'new-path-input' | 'pathname-input'
  ): Promise<ElementHandle<HTMLInputElement>>;
  private async getElement(
    prefix: 'push-button' | 'replace-button'
  ): Promise<ElementHandle<HTMLButtonElement>>;
  private async getElement(
    prefix: 'push-link' | 'replace-link'
  ): Promise<ElementHandle<HTMLAnchorElement>>;
  private async getElement(
    prefix:
      | 'new-path-input'
      | 'pathname-input'
      | 'push-button'
      | 'replace-button'
      | 'push-link'
      | 'replace-link'
  ): Promise<ElementHandle<HTMLElement>> {
    // tslint:disable-next-line:no-non-null-assertion
    return (await page.$(`#${prefix}-${this.specifier}`))!;
  }
}

describe('integration test: "history-service"', () => {
  const browser = new Browser(5000);
  const a = new HistoryConsumerUi(browser, 'a');
  const b = new HistoryConsumerUi(browser, 'b');

  let server: Server;
  let url: string;

  beforeAll(async () => {
    server = await startServer(webpackConfigs, nodeIntegratorWebpackConfig);

    const {port} = server.address() as AddressInfo;

    url = `http://localhost:${port}/`;

    // Trigger initial webpack DEV build
    await browser.goto(url, 120000);
  });

  afterAll((done) => server.close(done));

  test('Scenario 1: The user loads a page without consumer-specific pathnames', async () => {
    await browser.goto(url);

    expect(await browser.getPath()).toBe('/');
    expect(await a.getPathname()).toBe('/');
    expect(await b.getPathname()).toBe('/');
  });

  test('Scenario 2: The user loads a page with consumer-specific pathnames', async () => {
    await browser.goto(
      `${url}?test:history-consumer:a=/a1&test:history-consumer:b=/b1`
    );

    expect(await browser.getPath()).toBe(
      '/?test:history-consumer:a=/a1&test:history-consumer:b=/b1'
    );

    expect(await a.getPathname()).toBe('/a1');
    expect(await b.getPathname()).toBe('/b1');
  });

  test('Scenario 3: Consumer A pushes a new pathname', async () => {
    await browser.goto(url);

    expect(await browser.getPath()).toBe('/');

    await a.push('/a1');

    expect(await browser.getPath()).toBe('/?test:history-consumer:a=/a1');
    expect(await a.getPathname()).toBe('/a1');
    expect(await b.getPathname()).toBe('/');
  });

  test('Scenario 4: Consumer A pushes a new pathname and then the user navigates back', async () => {
    await browser.goto(url);
    await a.push('/a1');
    await browser.goBack();

    expect(await browser.getPath()).toBe('/');
    expect(await a.getPathname()).toBe('/');
    expect(await b.getPathname()).toBe('/');
  });

  test('Scenario 5: Consumer A pushes a new pathname and then the user navigates back and forward', async () => {
    await browser.goto(url);

    expect(await browser.getPath()).toBe('/');

    await a.push('/a1');
    await browser.goBack();
    await browser.goForward();

    expect(await browser.getPath()).toBe('/?test:history-consumer:a=/a1');
    expect(await a.getPathname()).toBe('/a1');
    expect(await b.getPathname()).toBe('/');
  });

  test('Scenario 6: Consumers A and B both push new pathnames', async () => {
    await browser.goto(url);

    expect(await browser.getPath()).toBe('/');

    await a.push('/a1');
    await b.push('/b1');

    expect(await browser.getPath()).toBe(
      '/?test:history-consumer:a=/a1&test:history-consumer:b=/b1'
    );

    expect(await a.getPathname()).toBe('/a1');
    expect(await b.getPathname()).toBe('/b1');
  });

  test('Scenario 7: Consumer A pushes a new pathname, B replaces their pathname, and then the user navigates back', async () => {
    await browser.goto(url);

    expect(await browser.getPath()).toBe('/');

    await a.push('/a1');
    await b.replace('/b1');
    await browser.goBack();

    expect(await browser.getPath()).toBe('/');
    expect(await a.getPathname()).toBe('/');
    expect(await b.getPathname()).toBe('/');
  });

  test('Scenario 8: Consumer A pushes a new pathname two times, then the user navigates back two times, and consumer B pushes a new pathname', async () => {
    await browser.goto(url);

    expect(await browser.getPath()).toBe('/');

    await a.push('/a1');
    await a.push('/a2');
    await browser.goBack();
    await browser.goBack();
    await b.push('/b1');

    expect(await browser.getPath()).toBe('/?test:history-consumer:b=/b1');
    expect(await a.getPathname()).toBe('/');
    expect(await b.getPathname()).toBe('/b1');
  });

  test('Scenario 9: Consumer A pushes a new pathname two times, then the user reloads the page, and navigates back', async () => {
    await browser.goto(url);
    await a.push('/a1');
    await a.push('/a2');
    await browser.reload();
    await browser.goBack();

    expect(await browser.getPath()).toBe('/?test:history-consumer:a=/a1');
    expect(await a.getPathname()).toBe('/a1');
    expect(await b.getPathname()).toBe('/');
  });

  test('Scenario 10: Server-side rendered Feature Apps receive correct consumer paths', async () => {
    // We need to disable JavaScript for this test to ensure that the server-rendered HTML is observed.
    await page.setJavaScriptEnabled(false);

    await browser.goto(
      `${url}?test:history-consumer:a=/a1&test:history-consumer:b=/b1`
    );

    expect(await a.getPathname()).toBe('/a1');
    expect(await b.getPathname()).toBe('/b1');

    // Re-enable JavaScript to restore the default behavior for all other tests.
    await page.setJavaScriptEnabled(true);
  });

  test('Scenario 11: Consumers A and B push/replace a new pathnames using the Link component from react-router-dom', async () => {
    await browser.goto(url);

    expect(await browser.getPath()).toBe('/');

    await a.clickPushLink();

    expect(await browser.getPath()).toBe('/?test:history-consumer:a=/foo');
    expect(await a.getPathname()).toBe('/foo');
    expect(await b.getPathname()).toBe('/');

    await b.clickReplaceLink();

    expect(await browser.getPath()).toBe(
      '/?test:history-consumer:a=/foo&test:history-consumer:b=/bar'
    );

    expect(await a.getPathname()).toBe('/foo');
    expect(await b.getPathname()).toBe('/bar');
  });
});
