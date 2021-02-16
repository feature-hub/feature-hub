import {Css} from '@feature-hub/react';
import express from 'express';
import getPort from 'get-port';
import {Server} from 'http';
import webpack from 'webpack';
import devMiddleware from 'webpack-dev-middleware';
import {AppRendererResult, loadNodeIntegrator} from './node-integrator';

function createStylesheetLink({href, media = 'all'}: Css): string {
  return `<link href="${href}" media="${media}" rel="stylesheet" />`;
}

function createStylesheetLinks(stylesheets: Css[]): string {
  return stylesheets.map(createStylesheetLink).join('\n');
}

function createDocumentHtml(
  bodyHtml: string,
  {
    serializedStates,
    stylesheetsForSsr,
    urlsForHydration,
  }: Partial<AppRendererResult> = {}
): string {
  const stylesheetLinks = stylesheetsForSsr
    ? createStylesheetLinks(Array.from(stylesheetsForSsr.values()))
    : '';

  const serializedStatesScript = serializedStates
    ? `<script type="x-feature-hub/serialized-states">${serializedStates}</script>`
    : '';

  const urlsForHydrationScript =
    urlsForHydration && urlsForHydration.size
      ? `<script type="x-feature-hub/urls-for-hydration">${JSON.stringify(
          Array.from(urlsForHydration)
        )}</script>`
      : '';

  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        ${stylesheetLinks}
      </head>
      <body>
        ${bodyHtml}
        ${serializedStatesScript}
        ${urlsForHydrationScript}
        <script src="integrator.js"></script>
      </body>
    </html>
  `;
}

export async function startServer(
  webpackConfigs: webpack.Configuration[],
  nodeIntegratorWebpackConfig?: webpack.Configuration,
  demoName?: string
): Promise<Server> {
  const port = await getPort(demoName ? {port: 3000} : undefined);
  const app = express();

  for (const compiler of webpack(webpackConfigs).compilers) {
    app.use(devMiddleware(compiler));
  }

  const nodeIntegratorCompiler =
    nodeIntegratorWebpackConfig && webpack(nodeIntegratorWebpackConfig);

  const nodeIntegratorFilename =
    nodeIntegratorCompiler?.options.output?.filename;

  if (nodeIntegratorCompiler) {
    app.use(devMiddleware(nodeIntegratorCompiler, {serverSideRender: true}));
  }

  app.get('/', async (req, res) => {
    try {
      const renderApp =
        typeof nodeIntegratorFilename === 'string' &&
        loadNodeIntegrator(res, nodeIntegratorFilename);

      if (renderApp) {
        const renderResult = await renderApp({port, req});

        res.send(
          createDocumentHtml(`<main>${renderResult.html}</main>`, renderResult)
        );
      } else {
        res.send(createDocumentHtml(`<main></main>`));
      }
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

  return new Promise<Server>((resolve) => {
    const server = app.listen(port, () => resolve(server));
  });
}
