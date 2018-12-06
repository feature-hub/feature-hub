import {join} from 'path';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';
import {Configuration} from 'webpack';

const baseConfig: Configuration = {
  devtool: false,
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: {loader: 'ts-loader'}
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.json', '.ts', '.tsx'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: join(__dirname, '../../tsconfig.json')
      })
    ]
  }
};

export const config: Configuration[] = [
  {
    ...baseConfig,
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
    ...baseConfig,
    entry: join(__dirname, './integrator.tsx'),
    output: {
      filename: 'integrator.js',
      publicPath: '/'
    }
  }
];
