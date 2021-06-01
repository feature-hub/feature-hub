// @ts-check

const express = require('express');
const path = require('path');
const getPort = require('get-port');
const {default: renderApp} = require('../../../../dist/integrator.node');

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
  {serializedStates, stylesheetsForSsr, urlsForHydration} = {}
) {
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

async function startServer(demoName) {
  const port = await getPort(demoName ? {port: 3000} : undefined);
  const app = express();

  const cache = new Map();

  app.use('/', express.static(path.join(__dirname, '../../../../dist')));
  app.get('/', async (req, res) => {
    try {
      console.log('renderApp', Object.keys(renderApp));
      if (renderApp) {
        const renderResult = await renderApp({port, req, cache});

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

  return new Promise((resolve) => {
    const server = app.listen(port, () => resolve(server));
  });
}

//module.exports = {startServer};

(async () => {
  await startServer('test');
})();
