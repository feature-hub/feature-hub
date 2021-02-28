const ModuleFederationPlugin = require('webpack').container
  .ModuleFederationPlugin;

const path = require('path');
// const webpackBaseConfig = require('../webpack-base-config');

const configs = [
  {
    entry: path.join(__dirname, './feature-app.tsx'),
    mode: 'development',
    target: 'node',
    output: {
      filename: 'feature-app.commonjs.js',
      //libraryTarget: 'commonjs2',
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
        },
      }),
    ],
  },
];

module.exports = configs;
