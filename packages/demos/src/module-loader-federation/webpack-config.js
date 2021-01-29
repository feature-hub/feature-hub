// @ts-check
const ModuleFederationPlugin = require('webpack').container
  .ModuleFederationPlugin;
const merge = require('webpack-merge');

const path = require('path');
const webpackBaseConfig = require('../webpack-base-config');

const configs = [
  merge.merge(webpackBaseConfig, {
    entry: path.join(__dirname, './feature-app.tsx'),

    output: {
      filename: 'feature-app.umd.js',
      //libraryTarget: 'umd',
      publicPath: '/',
    },
    plugins: [
      new ModuleFederationPlugin({
        filename: 'remoteEntry.js',
        name: 'app',
        exposes: {
          './featureAppDefinition':
            './src/module-loader-federation/feature-app',
        },
        shared: {
          react: {singleton: true},
          'react-dom': {singleton: true},
        },
      }),
    ],
  }),
  merge.merge(webpackBaseConfig, {
    entry: path.join(__dirname, './integrator.tsx'),
    output: {
      filename: 'integrator.js',
      publicPath: '/',
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'integrator',
        shared: {
          react: {singleton: true},
          'react-dom': {singleton: true},
        },
      }),
    ],
  }),
];

module.exports = configs;
