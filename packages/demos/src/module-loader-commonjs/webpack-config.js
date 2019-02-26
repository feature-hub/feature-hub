// @ts-check
const {join} = require('path');
const webpack = require('webpack');
const webpackBaseConfig = require('../webpack-base-config');

/**
 * @type {webpack.Configuration[]}
 */
const configs = [
  {
    ...webpackBaseConfig,
    entry: join(__dirname, './feature-app.tsx'),
    output: {
      filename: 'feature-app.commonjs.js',
      libraryTarget: 'commonjs2',
      publicPath: '/'
    },
    target: 'node'
  },
  {
    ...webpackBaseConfig,
    entry: join(__dirname, './integrator.ts'),
    output: {
      filename: 'integrator.js',
      publicPath: '/'
    }
  }
];

module.exports = configs;
