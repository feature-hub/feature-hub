// @ts-check

const globby = require('globby');
const path = require('path');

const basename = 'packages/website/build/feature-hub';
const indexFilenames = new Set();
const binaryDirnames = new Set();
const nonBinaryDirnames = new Set();

const filenames = globby
  .sync(path.join(__dirname, 'packages/website/build/feature-hub/**/*'))
  .map((filename) => path.relative(__dirname, filename));

for (const filename of filenames) {
  if (path.basename(filename) === 'index.html') {
    indexFilenames.add(filename);
  } else if (path.extname(filename) === '.png') {
    binaryDirnames.add(path.dirname(filename));
  } else {
    nonBinaryDirnames.add(path.dirname(filename));
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

/** @type {Record<string, import('aws-simple').Route>} */
const routes = {};

for (const filename of indexFilenames) {
  routes['/' + path.relative(basename, path.dirname(filename))] = {
    kind: 'file',
    filename,
    responseHeaders,
  };
}

for (const dirname of binaryDirnames) {
  routes['/' + path.relative(basename, dirname) + '/'] = {
    kind: 'folder',
    dirname,
    responseHeaders,
    binaryMediaTypes: ['image/png'],
  };
}

for (const dirname of nonBinaryDirnames) {
  if (dirname === basename) {
    continue;
  }

  routes['/' + path.relative(basename, dirname) + '/'] = {
    kind: 'folder',
    dirname,
    responseHeaders,
  };
}

const aliasRecordName = process.env.AWS_ALIAS_RECORD_NAME || undefined;

/**
 * @type {import('aws-simple').App}
 */
exports.default = {
  appName: 'featurehub',
  appVersion: aliasRecordName,
  customDomain: {
    certificateArn: process.env.AWS_CERTIFICATE_ARN,
    hostedZoneId: process.env.AWS_HOSTED_ZONE_ID,
    hostedZoneName: process.env.AWS_HOSTED_ZONE_NAME,
    aliasRecordName,
  },
  routes: () => routes,
};
