// @ts-check

import globby from 'globby';
import path from 'path';
import url from 'url';

const basename = 'packages/website/build/feature-hub';
const indexFilenames = new Set();
const dirnames = new Set();
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const filenames = globby
  .sync(path.join(__dirname, 'packages/website/build/feature-hub/**/*'))
  .map((filename) => path.relative(__dirname, filename));

for (const filename of filenames) {
  if (path.basename(filename) === 'index.html') {
    indexFilenames.add(filename);
  } else {
    dirnames.add(path.dirname(filename));
  }
}

const responseHeaders = {
  'Cache-Control': `public, max-age=${60 * 5}`,
  'Strict-Transport-Security': `max-age=${
    60 * 60 * 24 * 365
  }; includeSubDomains`,
  'X-Frame-Options': 'SAMEORIGIN',
  'X-XSS-Protection': '1; mode=block',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy':
    "default-src 'self' 'unsafe-eval' 'unsafe-inline' unpkg.com cdnjs.cloudflare.com cdn.jsdelivr.net; script-src 'self' 'unsafe-inline' 'unsafe-eval' unpkg.com cdnjs.cloudflare.com cdn.jsdelivr.net; img-src 'self' img.shields.io data:; connect-src 'self' *.algolia.net; upgrade-insecure-requests; block-all-mixed-content;",
};

/** @type {import('aws-simple').Route[]} */
const routes = [];

for (const filename of indexFilenames) {
  routes.push({
    type: 'file',
    path: filename,
    publicPath: '/' + path.relative(basename, path.dirname(filename)),
    responseHeaders,
  });
}

for (const dirname of dirnames) {
  if (dirname === basename) {
    continue;
  }

  routes.push({
    type: 'folder',
    path: dirname,
    publicPath: '/' + path.relative(basename, dirname) + '/*',
    responseHeaders,
  });
}

const aliasRecordName = process.env.AWS_ALIAS_RECORD_NAME || undefined;

/**
 * @type {import('aws-simple').ConfigFileDefaultExport}
 */
export default () => ({
  hostedZoneName: process.env.AWS_HOSTED_ZONE_NAME,
  aliasRecordName,
  cachingEnabled: true,
  monitoring: {accessLoggingEnabled: true},
  terminationProtectionEnabled: !aliasRecordName,
  routes,
});
