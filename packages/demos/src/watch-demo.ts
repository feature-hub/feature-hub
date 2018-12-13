import {AddressInfo} from 'net';
import {Configuration} from 'webpack';
import {startServer} from './start-server';

const demoName = process.argv[2];

function loadWebpackConfigs(): Configuration[] {
  const webpackConfigs: Configuration[] = require(`./${demoName}/webpack-config`)
    .default;

  for (const webpackConfig of webpackConfigs) {
    webpackConfig.devtool = 'source-map';
    webpackConfig.mode = 'development';
  }

  return webpackConfigs;
}

startServer(loadWebpackConfigs())
  .then(server => {
    const {port} = server.address() as AddressInfo;

    console.log(`The ${demoName} demo is running at: http://localhost:${port}`);
  })
  .catch(error => {
    console.error(error.toString());
  });
