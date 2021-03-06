const ModuleFederationPlugin = require('webpack').container
  .ModuleFederationPlugin;
const ZipPlugin = require('zip-webpack-plugin');

const path = require('path');
const {createNodeIntegratorWebpackConfig} = require('../webpack-base-config');

const webpackConfigIntegrator = {
  entry: path.join(__dirname, './integrator.node.tsx'),
  mode: 'development',
  devtool: 'source-map',
  output: {
    filename: 'integrator.node.js',
    libraryTarget: 'commonjs2',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  target: 'node',
  stats: {
    assets: true,
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
      name: 'integrator.node',
      library: {type: 'commonjs-module'},
      shared: [],
      /* {
        react: {singleton: true, eager: true},
        'react-dom': {singleton: true, eager: true},
      },*/
    }),
  ],
};

module.exports = webpackConfigIntegrator;
