// @ts-check

const {startServer} = require('./start-server');

const demoName = process.argv[2];

/**
 * Requires one of the demo's optional files. Only a file the demo doesn't have
 * returns `undefined`; an error thrown while loading a file that exists, such
 * as a syntax error, propagates.
 *
 * @param {string} name
 * @return {any}
 */
function requireOptional(name) {
  let resolved;

  try {
    resolved = require.resolve(`./${demoName}/${name}`);
  } catch {
    return undefined;
  }

  return require(resolved);
}

/**
 * @return {import('webpack').Configuration[]}
 */
function loadWebpackConfigs() {
  /** @type {import('webpack').Configuration[] | undefined} */
  const configs = requireOptional('webpack-config');

  // A demo built entirely by another bundler (e.g. Vite) has no webpack
  // config; it is served from static mounts provided by `prepare()`.
  if (!configs) {
    return [];
  }

  for (const config of configs) {
    config.devtool = 'source-map';
  }

  return configs;
}

/**
 * @return {import('webpack').Configuration | undefined}
 */
function loadNodeIntegratorWebpackConfig() {
  /** @type {import('webpack').Configuration | undefined} */
  const config = requireOptional('webpack-config.node');

  if (config) {
    config.devtool = 'source-map';
  }

  return config;
}

/**
 * Optional per-demo hook. If a demo needs artifacts built by another bundler
 * (e.g. a Vite Feature App remote) served alongside the webpack integrator, it
 * can export an async `prepare()` returning static mounts.
 *
 * @return {Promise<{route: string, dir: string}[]>}
 */
async function loadStaticMounts() {
  const {prepare} = requireOptional('prepare') ?? {};

  if (!prepare) {
    return [];
  }

  /** @type {{staticMounts?: {route: string, dir: string}[]}} */
  const result = (await prepare({watch: true})) ?? {};

  return result.staticMounts ?? [];
}

loadStaticMounts()
  .then((staticMounts) =>
    startServer(
      loadWebpackConfigs(),
      loadNodeIntegratorWebpackConfig(),
      demoName,
      staticMounts,
    ),
  )
  .then((server) => {
    const {port} = /** @type {import('net').AddressInfo} */ (server.address());

    console.log(`The ${demoName} demo is running at: http://localhost:${port}`);
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
