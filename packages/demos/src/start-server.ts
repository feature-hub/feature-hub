import express from 'express';
import getPort from 'get-port';
import {Server} from 'http';
import webpack from 'webpack';
import devMiddleware from 'webpack-dev-middleware';

export type MainHtmlRenderer = (port: number) => Promise<string>;

export async function startServer(
  webpackConfigs: webpack.Configuration[],
  renderMainHtml: MainHtmlRenderer | undefined
): Promise<Server> {
  const port = await getPort();
  const app = express();

  app.get('/', async (_req, res) => {
    const mainHtml = renderMainHtml ? await renderMainHtml(port) : '';

    res.send(
      `<html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body>
          <main>${mainHtml}</main>
          <script src="integrator.js"></script>
        </body>
      </html>`
    );
  });

  app.use(devMiddleware(webpack(webpackConfigs), {publicPath: '/'}));

  return new Promise<Server>(resolve => {
    const server = app.listen(port, () => resolve(server));
  });
}
