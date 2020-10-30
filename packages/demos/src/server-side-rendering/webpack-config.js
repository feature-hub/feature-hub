// @ts-check
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const webpackBaseConfig = require('../webpack-base-config');

/**
 * @type {webpack.Configuration}
 */
const featureAppConfig = merge.smart(webpackBaseConfig, {
  entry: path.join(__dirname, './feature-app.tsx'),
  externals: {
    react: 'react',
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
    plugins: [
      new CopyPlugin(
        [
          'normalize.css/normalize.css',
          '@blueprintjs/icons/lib/css/blueprint-icons.css',
          '@blueprintjs/core/lib/css/blueprint.css',
        ].map((cssPath) => ({from: require.resolve(cssPath)}))
      ),
    ],
  }),
];

module.exports = configs;
