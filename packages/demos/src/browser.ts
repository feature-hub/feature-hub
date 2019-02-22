import {Page} from 'puppeteer';
import {UrlWithStringQuery, parse} from 'url';

export class Browser {
  public constructor(private readonly defaultNavigationTimeout: number) {}

  public async getUrl(): Promise<UrlWithStringQuery> {
    return parse(await page.evaluate('location.href'));
  }

  public async getPath(): Promise<string> {
    return decodeURIComponent((await this.getUrl()).path || '');
  }

  public async goto(
    url: string,
    timeout: number = this.defaultNavigationTimeout
  ): Promise<void> {
    await page.goto(url, {timeout});
  }

  public async reload(): Promise<void> {
    await this.waitForNavigation(page.evaluate('location.reload()'));
  }

  public async goBack(): Promise<void> {
    await this.waitForNavigation(page.evaluate('history.back()'));
  }

  public async goForward(): Promise<void> {
    await this.waitForNavigation(page.evaluate('history.forward()'));
  }

  public async waitForNavigation(
    cause: Promise<unknown>,
    timeout: number = this.defaultNavigationTimeout
  ): Promise<void> {
    await Promise.all([page.waitForNavigation({timeout}), cause]);
  }

  public async newPage(): Promise<Page> {
    return browser.newPage();
  }
}
