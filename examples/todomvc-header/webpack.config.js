// @ts-check

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const webpack = require('webpack');

/** @type webpack.Configuration */
const config = {
  entry: ['./src/index.ts', './src/index.css'],
  output: {
    filename: 'todomvc-header.js',
    path: path.resolve(__dirname, 'dist'),
    libraryTarget: 'umd'
  },
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx']
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: path.resolve(__dirname, 'tsconfig.build.json')
          }
        }
      },
      {
        test: /\.css$/,
        // @ts-ignore
        use: [{loader: MiniCssExtractPlugin.loader}, 'css-loader']
      }
    ]
  },
  plugins: [new MiniCssExtractPlugin({filename: 'todomvc-header.css'})],
  devtool: 'source-map'
};

module.exports = config;
