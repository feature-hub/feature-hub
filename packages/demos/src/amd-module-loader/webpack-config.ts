import {join} from 'path';
import TsConfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import {Configuration} from 'webpack';

const webpackBaseConfig: Configuration = {
  devtool: false,
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
    plugins: [
      new TsConfigPathsPlugin({
        configFile: join(__dirname, '../../tsconfig.json')
      })
    ]
  },
  resolveLoader: {
    modules: [join(__dirname, '../../node_modules'), 'node_modules']
  }
};

export default [
  {
    ...webpackBaseConfig,
    entry: join(__dirname, './feature-app.tsx'),
    externals: {
      react: 'react'
    },
    output: {
      filename: 'feature-app.umd.js',
      libraryTarget: 'umd',
      publicPath: '/'
    }
  },
  {
    ...webpackBaseConfig,
    entry: join(__dirname, './integrator.tsx'),
    output: {
      filename: 'integrator.js',
      publicPath: '/'
    }
  }
] as Configuration[];
