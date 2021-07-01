// @ts-check
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const {merge} = require('webpack-merge');
const {webpackBaseConfig} = require('../webpack-base-config');

/**
 * @type {webpack.Configuration[]}
 */
const configs = [
  merge(webpackBaseConfig, {
    entry: path.join(__dirname, './feature-app.tsx'),
    output: {
      filename: 'feature-app.umd.js',
      libraryTarget: 'umd',
      publicPath: '/',
    },
    externals: {
      react: 'react',
    },
  }),
  merge(webpackBaseConfig, {
    entry: {},
    output: {
      filename: 'feature-app.federated.js',
      publicPath: '/',
    },
    plugins: [
      new webpack.container.ModuleFederationPlugin({
        name: '__feature_hub_feature_app_module_container__',
        exposes: {
          featureAppModule: path.join(__dirname, './feature-app'),
        },
        shared: {
          react: {singleton: true},
        },
      }),
    ],
  }),
  merge(webpackBaseConfig, {
    entry: path.join(__dirname, './feature-app.tsx'),
    output: {
      filename: 'feature-app.commonjs.js',
      libraryTarget: 'commonjs2',
      publicPath: '/',
    },
    target: 'node',
    externals: {
      react: 'react',
    },
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
      new CopyPlugin({
        patterns: [
          'normalize.css/normalize.css',
          '@blueprintjs/icons/lib/css/blueprint-icons.css',
          '@blueprintjs/core/lib/css/blueprint.css',
        ].map((cssPath) => ({from: require.resolve(cssPath)})),
      }),
    ],
  }),
];

module.exports = configs;
