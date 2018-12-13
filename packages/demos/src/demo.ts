import {AddressInfo} from 'net';
import {Configuration} from 'webpack';
import {startServer} from './start-server';

const demoName = process.argv[2];

function loadWebpackConfig(): Configuration[] {
  return (require(`./${demoName}/webpack-config`)
    .default as Configuration[]).map(webpackConfig => {
    webpackConfig.devtool = 'source-map';
    webpackConfig.mode = 'development';

    return webpackConfig;
  });
}

startServer(loadWebpackConfig())
  .then(server => {
    const {port} = server.address() as AddressInfo;

    console.log(`The ${demoName} demo is running at: http://localhost:${port}`);
  })
  .catch(error => {
    console.error(error.toString());
  });
