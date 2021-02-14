import {AddressInfo} from 'net';
import {Configuration} from 'webpack';
import {startServer} from './start-server';

const demoName = process.argv[2];

function loadWebpackConfigs(): Configuration[] {
  const configs: Configuration[] = require(`./${demoName}/webpack-config`);

  for (const config of configs) {
    config.devtool = 'source-map';
  }

  return configs;
}

function loadNodeWebpackConfig(): Configuration | undefined {
  try {
    const config: Configuration = require(`./${demoName}/webpack-config.node`);

    config.devtool = 'source-map';

    return config;
  } catch {
    return undefined;
  }
}

startServer(loadWebpackConfigs(), loadNodeWebpackConfig(), demoName)
  .then((server) => {
    const {port} = server.address() as AddressInfo;

    console.log(`The ${demoName} demo is running at: http://localhost:${port}`);
  })
  .catch((error) => {
    console.error(error);
  });
