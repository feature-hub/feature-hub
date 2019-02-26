// @ts-check
const {join} = require('path');
const webpack = require('webpack');
const webpackBaseConfig = require('../webpack-base-config');

/**
 * @type {webpack.Configuration}
 */
const featureAppConfig = {
  ...webpackBaseConfig,
  entry: join(__dirname, './feature-app.tsx'),
  externals: {
    react: 'react'
  }
};

/**
 * @type {webpack.Configuration[]}
 */
const configs = [
  {
    ...featureAppConfig,
    output: {
      filename: 'feature-app.umd.js',
      libraryTarget: 'umd',
      publicPath: '/'
    }
  },
  {
    ...featureAppConfig,
    output: {
      filename: 'feature-app.commonjs.js',
      libraryTarget: 'commonjs2',
      publicPath: '/'
    },
    target: 'node'
  },
  {
    ...webpackBaseConfig,
    entry: join(__dirname, './integrator.tsx'),
    output: {
      filename: 'integrator.js',
      publicPath: '/'
    }
  }
];

module.exports = configs;
