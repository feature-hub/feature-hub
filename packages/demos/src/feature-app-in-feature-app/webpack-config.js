// @ts-check
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const {nodeIntegratorFilename} = require('../node-integrator');
const webpackBaseConfig = require('../webpack-base-config');

/**
 * @type {webpack.Configuration}
 */
const featureAppConfig = merge.smart(webpackBaseConfig, {
  entry: path.join(__dirname, './feature-app-outer.tsx'),
  externals: {
    react: 'react',
    '@feature-hub/react': '@feature-hub/react',
  },
});

/**
 * @type {webpack.Configuration[]}
 */
const configs = [
  merge.smart(featureAppConfig, {
    output: {
      filename: 'feature-app.umd.js',
      libraryTarget: 'umd',
      publicPath: '/',
    },
  }),
  merge.smart(featureAppConfig, {
    output: {
      filename: 'feature-app.commonjs.js',
      libraryTarget: 'commonjs2',
      publicPath: '/',
    },
    target: 'node',
  }),
  merge.smart(webpackBaseConfig, {
    entry: path.join(__dirname, './integrator.tsx'),
    output: {
      filename: 'integrator.js',
      publicPath: '/',
    },
  }),

  merge.smart(webpackBaseConfig, {
    entry: path.join(__dirname, './integrator.node.tsx'),
    output: {
      filename: nodeIntegratorFilename,
      libraryTarget: 'commonjs2',
      publicPath: '/',
    },
    target: 'node',
  }),
];

module.exports = configs;
