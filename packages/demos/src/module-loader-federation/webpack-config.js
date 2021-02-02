// @ts-check
const ModuleFederationPlugin = require('webpack').container
  .ModuleFederationPlugin;

const path = require('path');
//const webpackBaseConfig = require('../webpack-base-config');

const configs = [
  {
    entry: path.join(__dirname, './feature-app.tsx'),
    mode: 'development',
    output: {
      //filename: 'feature-app.umd.js',
      //libraryTarget: 'umd',
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
        filename: 'remoteEntry.js',
        name: 'remoteEntry',
        exposes: {
          './featureAppDefinition':
            './src/module-loader-federation/feature-app',
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
  },
];

module.exports = configs;
