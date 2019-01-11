import {AddressInfo} from 'net';
import {Configuration} from 'webpack';
import {MainHtmlRenderer, startServer} from './start-server';

const demoName = process.argv[2];

function loadWebpackConfigs(): Configuration[] {
  const configPath = `./${demoName}/webpack-config`;
  const configs: Configuration[] = require(configPath).default;

  for (const config of configs) {
    config.devtool = 'source-map';
  }

  return configs;
}

function loadNodeIntegrator(): MainHtmlRenderer | undefined {
  const nodeIntegratorPath = `./${demoName}/integrator.node`;

  try {
    return require(nodeIntegratorPath).default;
  } catch {
    return;
  }
}

startServer(demoName, loadWebpackConfigs(), loadNodeIntegrator())
  .then(server => {
    const {port} = server.address() as AddressInfo;

    console.log(`The ${demoName} demo is running at: http://localhost:${port}`);
  })
  .catch(error => {
    console.error(error.toString());
  });
