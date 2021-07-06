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

const cacheControl = `max-age=${60 * 5}`;

/** @type {Record<string, import('aws-simple').Route>} */
const routes = {};

for (const filename of indexFilenames) {
  routes['/' + path.relative(basename, path.dirname(filename))] = {
    kind: 'file',
    filename,
    cacheControl,
  };
}

for (const dirname of binaryDirnames) {
  routes['/' + path.relative(basename, dirname) + '/'] = {
    kind: 'folder',
    dirname,
    cacheControl,
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
    cacheControl,
  };
}

/**
 * @type {import('aws-simple').App}
 */
exports.default = {
  appName: 'featurehub',
  customDomain: {
    certificateArn: process.env.AWS_CERTIFICATE_ARN,
    hostedZoneId: process.env.AWS_HOSTED_ZONE_ID,
    hostedZoneName: process.env.AWS_HOSTED_ZONE_NAME,
    aliasRecordName: process.env.AWS_ALIAS_RECORD_NAME || undefined,
  },
  routes: () => routes,
};
