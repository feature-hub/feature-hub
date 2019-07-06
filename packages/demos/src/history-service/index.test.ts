/**
 * @jest-environment puppeteer
 */

import {Server} from 'http';
import {AddressInfo} from 'net';
import {ElementHandle} from 'puppeteer';
import {Browser} from '../browser';
import {startServer} from '../start-server';
import renderApp from './integrator.node';
import webpackConfigs from './webpack-config';

jest.setTimeout(120000);

class HistoryConsumerUi {
  public constructor(
    private readonly browser: Browser,
    private readonly specifier: 'a' | 'b'
  ) {}

  public async getPathname(): Promise<string> {
    const pathnameInput = await this.getPathnameInput();

    const value = await pathnameInput.getProperty('value');

    return value.jsonValue();
  }

  public async push(pathname: string): Promise<void> {
    await (await this.getNewPathnameInput()).type(pathname);

    await this.browser.waitForNavigation((await this.getPushButton()).click());
  }

  public async replace(pathname: string): Promise<void> {
    await (await this.getNewPathnameInput()).type(pathname);

    await this.browser.waitForNavigation(
      (await this.getReplaceButton()).click()
    );
  }

  private async getNewPathnameInput(): Promise<
    ElementHandle<HTMLInputElement>
  > {
    // tslint:disable-next-line:no-non-null-assertion
    return (await page.$(`#new-pathname-${this.specifier}`))!;
  }

  private async getPathnameInput(): Promise<ElementHandle<HTMLInputElement>> {
    // tslint:disable-next-line:no-non-null-assertion
    return (await page.$(`#pathname-${this.specifier}`))!;
  }

  private async getPushButton(): Promise<ElementHandle<HTMLButtonElement>> {
    // tslint:disable-next-line:no-non-null-assertion
    return (await page.$(`#push-${this.specifier}`))!;
  }

  private async getReplaceButton(): Promise<ElementHandle<HTMLButtonElement>> {
    // tslint:disable-next-line:no-non-null-assertion
    return (await page.$(`#replace-${this.specifier}`))!;
  }
}

describe('integration test: "history-service"', () => {
  const browser = new Browser(5000);
  const a = new HistoryConsumerUi(browser, 'a');
  const b = new HistoryConsumerUi(browser, 'b');

  let server: Server;
  let url: string;

  beforeAll(async () => {
    server = await startServer(webpackConfigs, renderApp);

    const {port} = server.address() as AddressInfo;

    url = `http://localhost:${port}/`;

    // Trigger initial webpack DEV build
    await browser.goto(url, 120000);
  });

  afterAll(done => server.close(done));

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

  test('Scenario 6: Consumer A and B both push new pathnames', async () => {
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
});
