const ModuleFederationPlugin = require('webpack').container
  .ModuleFederationPlugin;
const ServerSideModuleFederationPlugin = require('server-side-module-federation-plugin');

const path = require('path');
// const webpackBaseConfig = require('../webpack-base-config');

const configs = [
  /* {
    entry: path.join(__dirname, './feature-app.tsx'),
    mode: 'development',
    output: {
      // filename: 'feature-app.umd.js',
      // libraryTarget: 'umd',
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
      new ModuleFederationPlugin({
        filename: 'remoteEntry-client.js',
        name: 'featureHubGlobal',
        exposes: {
          './featureAppDefinition': path.join(__dirname, './feature-app'),
        },
        shared: {
          react: {singleton: true},
          'react-dom': {singleton: true},
        },
      }),
    ],
  },
  {
    entry: path.join(__dirname, './integrator.tsx'),
    mode: 'development',

    output: {
      filename: 'integrator.js',
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
      new ModuleFederationPlugin({
        name: 'integrator',
        shared: {
          react: {singleton: true, eager: true},
          'react-dom': {singleton: true, eager: true},
        },
      }),
    ],
  },*/
  {
    entry: path.join(__dirname, './feature-app.tsx'),
    mode: 'development',
    devtool: 'inline-source-map',
    target: 'node',
    output: {
      // filename: 'feature-app.umd.js',
      // libraryTarget: 'umd',
      libraryTarget: 'commonjs-module',
      chunkLoading: 'async-http-node',
      publicPath: 'http://localhost:3000/',
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
        filename: 'remoteEntry.js',
        name: 'featureHubGlobal',
        exposes: {
          './featureAppDefinition': path.join(__dirname, './feature-app'),
        },
        library: {type: 'commonjs-module'},
        shared: {
          react: {singleton: true},
          'react-dom': {singleton: true},
          lodash: {},
        },
      }),
    ],
  },
];

module.exports = configs;
