import {join} from 'path';
import TsConfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import {Configuration} from 'webpack';

export const webpackBaseConfig: Configuration = {
  devtool: false,
  mode: 'production',
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
