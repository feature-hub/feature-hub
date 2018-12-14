import {AddressInfo} from 'net';
import {Configuration} from 'webpack';
import {startServer} from './start-server';

const demoName = process.argv[2];

function loadWebpackConfigs(): Configuration[] {
  const configPath = `./${demoName}/webpack-config`;
  const configs: Configuration[] = require(configPath).default;

  for (const config of configs) {
    config.devtool = 'source-map';
  }

  return configs;
}

startServer(loadWebpackConfigs())
  .then(server => {
    const {port} = server.address() as AddressInfo;

    console.log(`The ${demoName} demo is running at: http://localhost:${port}`);
  })
  .catch(error => {
    console.error(error.toString());
  });
