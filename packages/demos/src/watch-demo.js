// @ts-check

const {startServer} = require('./start-server');

const demoName = process.argv[2];

/**
 * @return {import('webpack').Configuration[]}
 */
function loadWebpackConfigs() {
  /** @type {import('webpack').Configuration[]} */
  const configs = require(`./${demoName}/webpack-config`);

  for (const config of configs) {
    config.devtool = 'source-map';
  }

  return configs;
}

/**
 * @return {import('webpack').Configuration | undefined}
 */
function loadNodeIntegratorWebpackConfig() {
  try {
    /** @type {import('webpack').Configuration} */
    const config = require(`./${demoName}/webpack-config.node`);

    config.devtool = 'source-map';

    return config;
  } catch {
    return undefined;
  }
}

startServer(loadWebpackConfigs(), loadNodeIntegratorWebpackConfig(), demoName)
  .then((server) => {
    const {port} = /** @type {import('net').AddressInfo} */ (server.address());

    console.log(`The ${demoName} demo is running at: http://localhost:${port}`);
  })
  .catch((error) => {
    console.error(error);
  });
