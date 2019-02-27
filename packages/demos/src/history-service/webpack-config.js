// @ts-check
const path = require('path');
const webpack = require('webpack');
const webpackBaseConfig = require('../webpack-base-config');

/**
 * @type {webpack.Configuration[]}
 */
const configs = [
  {
    ...webpackBaseConfig,
    entry: path.join(__dirname, './integrator.tsx'),
    output: {
      filename: 'integrator.js',
      publicPath: '/'
    }
  }
];

module.exports = configs;
