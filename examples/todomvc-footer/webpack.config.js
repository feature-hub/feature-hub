// @ts-check

const path = require('path');
const webpack = require('webpack');

/** @type webpack.Configuration */
const config = {
  entry: './src/index.tsx',
  output: {
    filename: 'todomvc-footer.js',
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
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: true,
              localIdentName: '[path][name]__[local]--[hash:base64:5]',
              sourceMap: true
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              ident: 'postcss',
              plugins: [require('postcss-cssnext')]
            }
          }
        ]
      }
    ]
  },
  devtool: 'source-map',
  externals: {
    react: 'react'
  }
};

module.exports = config;
