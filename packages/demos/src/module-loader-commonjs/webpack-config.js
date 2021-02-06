// @ts-check
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const {
  createNodeIntegratorWebpackConfig,
  webpackBaseConfig,
} = require('../webpack-base-config');

/**
 * @type {webpack.Configuration[]}
 */
const configs = [
  merge.smart(webpackBaseConfig, {
    entry: path.join(__dirname, './feature-app.tsx'),
    output: {
      filename: 'feature-app.commonjs.js',
      libraryTarget: 'commonjs2',
      publicPath: '/',
    },
    target: 'node',
  }),
  merge.smart(webpackBaseConfig, {
    entry: path.join(__dirname, './integrator.ts'),
    output: {
      filename: 'integrator.js',
      publicPath: '/',
    },
  }),
  createNodeIntegratorWebpackConfig(__dirname),
];

module.exports = configs;
