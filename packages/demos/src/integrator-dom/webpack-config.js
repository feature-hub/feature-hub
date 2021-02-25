// @ts-check
const path = require('path');
const webpack = require('webpack');
const {merge} = require('webpack-merge');
const {webpackBaseConfig} = require('../webpack-base-config');

/**
 * @type {webpack.Configuration[]}
 */
const configs = [
  merge(webpackBaseConfig, {
    entry: path.join(__dirname, './feature-app.ts'),
    output: {
      filename: 'feature-app.umd.js',
      libraryTarget: 'umd',
      publicPath: '/',
    },
  }),
  merge(webpackBaseConfig, {
    entry: path.join(__dirname, './integrator.ts'),
    output: {
      filename: 'integrator.js',
      publicPath: '/',
    },
  }),
];

module.exports = configs;
