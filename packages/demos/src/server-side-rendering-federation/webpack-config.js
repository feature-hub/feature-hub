// @ts-check
const ModuleFederationPlugin = require('webpack').container
  .ModuleFederationPlugin;

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
        filename: 'feature-app.js',
        name: 'featurehubGlobal',
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
        filename: 'feature-app-ssr.js',
        library: {type: 'commonjs-module'},
        name: 'featurehubGlobal',
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
    entry: path.join(__dirname, '../watch-demo-fed.ts'),
    mode: 'production',
    target: 'node',
    optimization: {
      minimize: false,
    },
    devtool: 'source-map',
    output: {
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
      new ModuleFederationPlugin({
        name: 'integrator-node',
        library: {type: 'commonjs-module'},
        shared: {
          react: {singleton: true, eager: true},
          'react-dom': {singleton: true, eager: true},
        },
      }),
    ],
  },
];

module.exports = configs;
