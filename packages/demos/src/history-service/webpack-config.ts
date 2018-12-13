import {join} from 'path';
import {Configuration} from 'webpack';
import {webpackBaseConfig} from '../webpack-base-config';

export default [
  {
    ...webpackBaseConfig,
    entry: join(__dirname, './integrator.tsx'),
    output: {
      filename: 'integrator.js',
      publicPath: '/'
    }
  }
] as Configuration[];
