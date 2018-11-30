// @ts-check
const path = require('path');
const webpack = require('webpack');

/** @type webpack.Configuration */
const config = {
  entry: './src/index.tsx',
  output: {
    filename: 'todomvc-main.js',
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
        test: /\.svg$/,
        use: ['url-loader']
      }
    ]
  },
  devtool: 'source-map',
  externals: {
    'styled-components': 'styled-components',
    react: 'react',
    'react-dom': 'react-dom'
  }
};

module.exports = config;
