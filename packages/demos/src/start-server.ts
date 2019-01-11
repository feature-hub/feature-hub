import express from 'express';
import getPort from 'get-port';
import {Server} from 'http';
import webpack from 'webpack';
import devMiddleware from 'webpack-dev-middleware';

export type MainHtmlRenderer = (port: number) => Promise<string>;

function createDocumentHtml(body: string): string {
  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="integrator.js"></script>
      </head>
      <body>
        ${body}
      </body>
    </html>
  `;
}

export async function startServer(
  webpackConfigs: webpack.Configuration[],
  renderMainHtml: MainHtmlRenderer | undefined,
  demoName?: string
): Promise<Server> {
  const port = await getPort({port: 3000});
  const app = express();

  app.get('/', async (_req, res) => {
    try {
      const mainHtml = renderMainHtml ? await renderMainHtml(port) : '';

      res.send(createDocumentHtml(`<main>${mainHtml}</main>`));
    } catch (error) {
      const documentHtml = demoName
        ? createDocumentHtml(`
            <div class="bp3-callout bp3-intent-danger">
              <h4 class="bp3-heading">Failed to render demo "${demoName}"</h4>
              <pre>${error.stack}</pre>
            </div>
          `)
        : error;

      res.send(documentHtml).status(500);
    }
  });

  app.use(devMiddleware(webpack(webpackConfigs), {publicPath: '/'}));

  return new Promise<Server>(resolve => {
    const server = app.listen(port, () => resolve(server));
  });
}
