// @ts-check
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const {nodeIntegratorFilename} = require('../node-integrator');
const webpackBaseConfig = require('../webpack-base-config');

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
