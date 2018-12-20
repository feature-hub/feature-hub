import {join} from 'path';
import {Configuration} from 'webpack';
import {webpackBaseConfig} from '../webpack-base-config';

export default [
  {
    ...webpackBaseConfig,
    entry: join(__dirname, './feature-app.tsx'),
    output: {
      filename: 'feature-app.commonjs.js',
      libraryTarget: 'commonjs2',
      publicPath: '/'
    },
    target: 'node'
  },
  {
    ...webpackBaseConfig,
    entry: join(__dirname, './integrator.ts'),
    output: {
      filename: 'integrator.js',
      publicPath: '/'
    }
  }
] as Configuration[];
