// @ts-check

const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
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
  plugins: [
    new webpack.DefinePlugin({
      'process.env.REACT_VERSION': JSON.stringify(getPkgVersion('react')),
      'process.env.FEATURE_HUB_REACT_VERSION': JSON.stringify(
        getPkgVersion('@feature-hub/react')
      ),
      'process.env.BLUEPRINT_NAMESPACE': "'bp3'",
    }),
  ],
};

/**
 * @param {string} dirname name of the directory that contains integrator.node.tsx
 * @return {webpack.Configuration}
 */
const createNodeIntegratorWebpackConfig = (dirname) =>
  merge.merge(webpackBaseConfig, {
    entry: path.join(dirname, './integrator.node.tsx'),
    output: {
      filename: 'integrator.node.js',
      libraryTarget: 'commonjs2',
      publicPath: '/',
    },
    target: 'node',
  });

module.exports = {webpackBaseConfig, createNodeIntegratorWebpackConfig};
