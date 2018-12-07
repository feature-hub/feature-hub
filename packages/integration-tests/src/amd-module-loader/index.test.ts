/**
 * @jest-environment puppeteer
 */

import express from 'express';
import getPort from 'get-port';
import {Server} from 'http';
import webpack from 'webpack';
import devMiddleware from 'webpack-dev-middleware';
import {config} from './webpack-config';

jest.setTimeout(60000);

describe('integration test: "amd module loader"', () => {
  let port: number;
  let server: Server;

  beforeAll(async done => {
    const app = express();

    app.get('/', (_req, res) => {
      res.send(
        '<html><body><main></main><script src="integrator.js"></script></body></html>'
      );
    });

    app.use(devMiddleware(webpack(config), {publicPath: '/'}));

    // tslint:disable-next-line:await-promise
    port = await getPort();
    server = app.listen(port, done);
  });

  afterAll(done => server.close(done));

  beforeEach(async () => {
    await page.goto(`http://localhost:${port}`);
  });

  it('loads the feature app with react as external', async () => {
    await expect(page).toMatch('Hello, World!');
  });
});
