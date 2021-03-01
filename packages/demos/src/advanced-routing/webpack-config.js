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
    entry: path.join(__dirname, './input-feature-app.tsx'),
    externals: {
      react: 'react',
    },
    output: {
      filename: 'input-feature-app.umd.js',
      libraryTarget: 'umd',
      publicPath: '/',
    },
  }),
  merge(webpackBaseConfig, {
    entry: path.join(__dirname, './hello-world-feature-app.tsx'),
    externals: {
      react: 'react',
    },
    output: {
      filename: 'hello-world-feature-app.umd.js',
      libraryTarget: 'umd',
      publicPath: '/',
    },
  }),
  merge(webpackBaseConfig, {
    entry: path.join(__dirname, './integrator.tsx'),
    output: {
      filename: 'integrator.js',
      publicPath: '/',
    },
  }),
];

module.exports = configs;
