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
    entry: path.join(__dirname, './feature-app.tsx'),
    output: {
      publicPath: '/',
    },
    plugins: [
      new webpack.container.ModuleFederationPlugin({
        filename: 'remoteEntry.js',
        name: 'featureHubGlobal',
        exposes: {
          './featureAppDefinition': path.join(__dirname, './feature-app'),
        },
        shared: {
          react: {singleton: true},
          'react-dom': {singleton: true},
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
        name: 'integrator',
        shared: {
          react: {singleton: true, eager: true},
          'react-dom': {singleton: true, eager: true},
        },
      }),
    ],
  }),
];

module.exports = configs;
