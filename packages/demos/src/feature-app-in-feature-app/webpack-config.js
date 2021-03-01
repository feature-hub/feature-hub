// @ts-check
const path = require('path');
const webpack = require('webpack');
const {merge} = require('webpack-merge');
const {webpackBaseConfig} = require('../webpack-base-config');

/**
 * @type {webpack.Configuration}
 */
const featureAppConfig = merge(webpackBaseConfig, {
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
  merge(featureAppConfig, {
    output: {
      filename: 'feature-app.umd.js',
      libraryTarget: 'umd',
      publicPath: '/',
    },
  }),
  merge(featureAppConfig, {
    output: {
      filename: 'feature-app.commonjs.js',
      libraryTarget: 'commonjs2',
      publicPath: '/',
    },
    target: 'node',
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
