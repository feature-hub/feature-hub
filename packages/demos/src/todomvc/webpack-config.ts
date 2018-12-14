import CopyPlugin from 'copy-webpack-plugin';
import {join} from 'path';
// @ts-ignore
import postcssPresetEnv from 'postcss-preset-env';
import {Configuration} from 'webpack';
import merge from 'webpack-merge';
import {webpackBaseConfig} from '../webpack-base-config';

const configs: Configuration[] = [
  {
    ...webpackBaseConfig,
    entry: join(__dirname, './header/index.ts'),
    externals: {
      react: 'react'
    },
    output: {
      path: '/header',
      filename: 'feature-app-header.umd.js',
      libraryTarget: 'umd',
      publicPath: '/header'
    },
    plugins: [new CopyPlugin([{from: join(__dirname, './header/index.css')}])]
  },
  {
    ...webpackBaseConfig,
    entry: join(__dirname, './main/index.tsx'),
    externals: {
      react: 'react'
    },
    output: {
      path: '/main',
      filename: 'feature-app-main.umd.js',
      libraryTarget: 'umd',
      publicPath: '/main'
    }
  },
  merge.smart(webpackBaseConfig, {
    entry: join(__dirname, './footer/index.tsx'),
    externals: {
      react: 'react'
    },
    output: {
      path: '/footer',
      filename: 'feature-app-footer.umd.js',
      libraryTarget: 'umd',
      publicPath: '/footer'
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            'style-loader',
            {
              loader: 'css-loader',
              options: {
                importLoaders: 1,
                modules: true,
                localIdentName: '[path][name]__[local]--[hash:base64:5]',
                sourceMap: true
              }
            },

            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: () => [postcssPresetEnv()]
              }
            }
          ]
        }
      ]
    }
  }),
  {
    ...webpackBaseConfig,
    entry: join(__dirname, './integrator.tsx'),
    output: {
      filename: 'integrator.js',
      publicPath: '/'
    },
    plugins: [new CopyPlugin([join(__dirname, './index.css')])]
  }
];

export default configs;
