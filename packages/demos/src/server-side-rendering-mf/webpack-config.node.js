const ServerSideModuleFederationPlugin = require('server-side-module-federation-plugin');

const path = require('path');
// const webpackBaseConfig = require('../webpack-base-config');

const config = {
  entry: path.join(__dirname, './integrator.node.tsx'),
  mode: 'development',

  output: {
    libraryTarget: 'commonjs-module',
    chunkLoading: 'async-http-node',
    filename: 'integrator.node.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        options: {
          presets: ['@babel/preset-react', '@babel/preset-typescript'],
        },
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
  plugins: [
    new ServerSideModuleFederationPlugin({
      name: 'integrator.node',
      library: {
        type: 'commonjs-module',
      },
      shared: {
        // react: {singleton: true, eager: true},
        // 'react-dom': {singleton: true, eager: true},
      },
    }),
  ],
};

module.exports = config;
