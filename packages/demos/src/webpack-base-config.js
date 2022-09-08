// @ts-check

const path = require('path');
const webpack = require('webpack');
const {merge} = require('webpack-merge');
const {getPkgVersion} = require('./get-pkg-version');

/**
 * @type {Partial<import('ts-loader').Options>}
 */
const tsLoaderOptions = {
  projectReferences: true,
  onlyCompileBundledFiles: true,
};

/**
 * @type {webpack.Configuration}
 */
const webpackBaseConfig = {
  devtool: false,
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: `source-map-loader`,
        enforce: `pre`,
      },
      {
        test: /\.tsx?$/,
        use: {loader: 'ts-loader', options: tsLoaderOptions},
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: 'url-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
  },
  resolveLoader: {
    modules: [path.join(__dirname, '../node_modules'), 'node_modules'],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.BLUEPRINT_NAMESPACE': '""',
      'process.env.REACT_VERSION': JSON.stringify(getPkgVersion('react')),
      'process.env.FEATURE_HUB_REACT_VERSION': JSON.stringify(
        getPkgVersion('@feature-hub/react')
      ),
    }),
  ],
};

/**
 * @param {string} dirname name of the directory that contains integrator.node.tsx
 * @return {webpack.Configuration}
 */
const createNodeIntegratorWebpackConfig = (dirname) =>
  merge(webpackBaseConfig, {
    entry: path.join(dirname, './integrator.node.tsx'),
    output: {
      filename: 'integrator.node.js',
      libraryTarget: 'commonjs2',
      publicPath: '/',
    },
    target: 'node',
  });

module.exports = {webpackBaseConfig, createNodeIntegratorWebpackConfig};
