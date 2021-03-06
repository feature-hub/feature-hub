const ModuleFederationPlugin = require('webpack').container
  .ModuleFederationPlugin;
const ZipPlugin = require('zip-webpack-plugin');

const path = require('path');
// const webpackBaseConfig = require('../webpack-base-config');

const configs = [
  {
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
          './featureAppDefinition': {
            name: 'myname',
            import: path.join(__dirname, './feature-app'),
          },
        },
        shared: {
          react: {singleton: true},
          'react-dom': {singleton: true},
          lodash: {},
        },
      }),
    ],
  },
  {
    entry: path.join(__dirname, './integrator.tsx'),
    mode: 'development',
    stats: 'none',

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
        name: 'integrator-client',
        shared: {
          react: {singleton: true, eager: true},
          'react-dom': {singleton: true, eager: true},
        },
      }),
    ],
  },
  {
    entry: path.join(__dirname, './feature-app.tsx'),
    mode: 'development',
    target: 'node',
    stats: 'none',
    output: {
      filename: 'feature-app.commonjs.js',
      publicPath: '/',
    },
    externals: ['enhanced-resolve'],
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
      new ZipPlugin({
        filename: 'bundle',
      }),
    ],
  },
];

module.exports = configs;
