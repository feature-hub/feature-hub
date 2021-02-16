/**
 * @jest-environment puppeteer
 */

import {Server} from 'http';
import {AddressInfo} from 'net';
import {ElementHandle} from 'puppeteer';
import {Browser} from '../browser';
import {startServer} from '../start-server';
import webpackConfigs from './webpack-config';

jest.setTimeout(120000);

class HelloWorldUi {
  public constructor(private readonly browser: Browser) {}

  public async waitForHelloText(): Promise<string> {
    const helloText = await page.waitForSelector('#hello-text');
    const content = await helloText.getProperty('textContent');

    return content.jsonValue();
  }

  public async submitNewName(name: string): Promise<void> {
    await (await this.getNewNameInput()).type(name);

    await this.browser.waitForNavigation(
      (await this.getSubmitButton()).click()
    );
  }

  private async getNewNameInput(): Promise<ElementHandle<HTMLInputElement>> {
    // tslint:disable-next-line:no-non-null-assertion
    return (await page.$('#name-input'))!;
  }

  private async getSubmitButton(): Promise<ElementHandle<HTMLButtonElement>> {
    // tslint:disable-next-line:no-non-null-assertion
    return (await page.$('#submit-button'))!;
  }
}

describe('integration test: "advanced-routing"', () => {
  const browser = new Browser(5000);
  const ui = new HelloWorldUi(browser);

  let server: Server;
  let url: string;

  beforeAll(async () => {
    server = await startServer(webpackConfigs);

    const {port} = server.address() as AddressInfo;

    url = `http://localhost:${port}/`;

    // Trigger initial webpack DEV build
    await browser.goto(url, 120000);
  });

  afterAll((done) => server.close(done));

  test('navigates to another page and sets a new hello world state', async () => {
    await browser.goto(url);

    await ui.submitNewName('Test');

    expect(await ui.waitForHelloText()).toBe('Hello, Test!');
  });
});
