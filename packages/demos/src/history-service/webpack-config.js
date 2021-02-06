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
    entry: path.join(__dirname, './integrator.tsx'),
    output: {
      filename: 'integrator.js',
      publicPath: '/',
    },
  }),
  createNodeIntegratorWebpackConfig(__dirname),
];

module.exports = configs;
