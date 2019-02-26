// @ts-check
const {join} = require('path');
const TsConfigPathsPlugin = require('tsconfig-paths-webpack-plugin').default;
const webpack = require('webpack');

/**
 * @type {webpack.Configuration}
 */
const webpackBaseConfig = {
  devtool: false,
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        use: 'url-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
    plugins: [
      new TsConfigPathsPlugin({
        configFile: join(__dirname, '../tsconfig.json')
      })
    ]
  },
  resolveLoader: {
    modules: [join(__dirname, '../node_modules'), 'node_modules']
  }
};

module.exports = webpackBaseConfig;
