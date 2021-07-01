// @ts-check
const webpack = require('webpack');
const {merge} = require('webpack-merge');
const path = require('path');
const {webpackBaseConfig} = require('../webpack-base-config');

/**
 * @type {webpack.Configuration[]}
 */
const configs = [
  merge(webpackBaseConfig, {
    entry: {},
    output: {
      filename: 'feature-app-1.federated.js',
      publicPath: '/',
    },
    plugins: [
      new webpack.container.ModuleFederationPlugin({
        name: '__feature_hub_feature_app_module_container__',
        exposes: {
          featureAppModule: path.join(__dirname, './feature-app-1'),
        },
        shared: {
          react: {singleton: true},
          '@blueprintjs/core': {},
        },
      }),
    ],
  }),
  merge(webpackBaseConfig, {
    entry: {},
    output: {
      filename: 'feature-app-2.federated.js',
      publicPath: '/',
    },
    plugins: [
      new webpack.container.ModuleFederationPlugin({
        name: '__feature_hub_feature_app_module_container__',
        exposes: {
          featureAppModule: path.join(__dirname, './feature-app-2'),
        },
        shared: {
          react: {singleton: true},
          '@blueprintjs/core': {},
        },
      }),
    ],
  }),
  merge(webpackBaseConfig, {
    entry: path.join(__dirname, './integrator.tsx'),
    output: {
      filename: 'integrator.js',
      publicPath: '/',
    },
    plugins: [
      new webpack.container.ModuleFederationPlugin({
        shared: {
          react: {singleton: true, eager: true},
        },
      }),
    ],
  }),
];

module.exports = configs;
