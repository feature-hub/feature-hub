// @ts-check

const path = require('path');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin').default;
const webpack = require('webpack');
const {getPkgVersion} = require('./get-pkg-version');

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
        use: 'ts-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: 'url-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
    plugins: [
      new TsConfigPathsPlugin({
        configFile: path.join(__dirname, '../tsconfig.json')
      })
    ]
  },
  resolveLoader: {
    modules: [path.join(__dirname, '../node_modules'), 'node_modules']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.REACT_VERSION': JSON.stringify(getPkgVersion('react')),
      'process.env.FEATURE_HUB_REACT_VERSION': JSON.stringify(
        getPkgVersion('@feature-hub/react')
      )
    })
  ]
};

module.exports = webpackBaseConfig;
