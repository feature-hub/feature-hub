// @ts-check

const express = require('express');
const getPort = require('get-port');
const webpack = require('webpack');
const devMiddleware = require('webpack-dev-middleware');
const {loadNodeIntegrator} = require('./node-integrator');

/**
 * @param {import('@feature-hub/react').Css} stylesheet
 * @return {string}
 */
function createStylesheetLink({href, media = 'all'}) {
  return `<link href="${href}" media="${media}" rel="stylesheet" />`;
}

/**
 * @param {import('@feature-hub/react').Css[]} stylesheets
 * @return {string}
 */
function createStylesheetLinks(stylesheets) {
  return stylesheets.map(createStylesheetLink).join('\n');
}

/**
 * @param {string} bodyHtml
 * @param {Partial<import('./app-renderer').AppRendererResult>} appRenderResult
 * @return {string}
 */
function createDocumentHtml(
  bodyHtml,
  {serializedStates, stylesheetsForSsr, hydrationSources} = {}
) {
  const stylesheetLinks = stylesheetsForSsr
    ? createStylesheetLinks(Array.from(stylesheetsForSsr.values()))
    : '';

  const serializedStatesScript = serializedStates
    ? `<script type="x-feature-hub/serialized-states">${serializedStates}</script>`
    : '';

  const urlsForHydrationScript =
    hydrationSources && hydrationSources.size
      ? `<script type="x-feature-hub/urls-for-hydration">${JSON.stringify(
          Array.from(hydrationSources.values())
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

/**
 * @param {import('webpack').Configuration[]} webpackConfigs
 * @param {webpack.Configuration=} nodeIntegratorWebpackConfig
 * @param {string=} demoName
 * @return {Promise<import('http').Server>}
 */
async function startServer(
  webpackConfigs,
  nodeIntegratorWebpackConfig,
  demoName
) {
  const port = await getPort(demoName ? {port: 3000} : undefined);
  const app = express();

  for (const compiler of webpack(webpackConfigs).compilers) {
    app.use(devMiddleware(compiler));
  }

  const nodeIntegratorCompiler =
    nodeIntegratorWebpackConfig && webpack(nodeIntegratorWebpackConfig);

  const nodeIntegratorFilename =
    nodeIntegratorCompiler &&
    nodeIntegratorCompiler.options.output &&
    nodeIntegratorCompiler.options.output.filename;

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
              <pre>${error instanceof Error ? error.stack : error}</pre>
            </div>
          `)
        : error;

      res.send(documentHtml).status(500);
    }
  });

  return new Promise((resolve) => {
    const server = app.listen(port, () => resolve(server));
  });
}

module.exports = {startServer};
