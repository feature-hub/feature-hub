import express from 'express';
import getPort from 'get-port';
import {Server} from 'http';
import webpack from 'webpack';
import devMiddleware from 'webpack-dev-middleware';

export async function startServer(
  webpackConfig: webpack.Configuration[]
): Promise<Server> {
  const app = express();

  app.get('/', (_req, res) => {
    res.send(
      `<html>
        <body>
          <main></main>
          <script src="integrator.js"></script>
        </body>
      </html>`
    );
  });

  app.use(devMiddleware(webpack(webpackConfig), {publicPath: '/'}));

  // tslint:disable-next-line:await-promise
  const port = await getPort();

  return new Promise<Server>(resolve => {
    const server = app.listen(port, () => resolve(server));
  });
}
