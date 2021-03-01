// @ts-check
const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const {merge, mergeWithRules} = require('webpack-merge');
const {webpackBaseConfig} = require('../webpack-base-config');

const websiteBuildDirname = path.resolve(
  __dirname,
  '../../../website/build/feature-hub/todomvc'
);

/**
 * @type {webpack.Configuration[]}
 */
const configs = [
  merge(webpackBaseConfig, {
    entry: path.join(__dirname, './header/index.ts'),
    externals: {
      react: 'react',
    },
    output: {
      path: path.join(websiteBuildDirname, 'header'),
      filename: 'feature-app-header.umd.js',
      libraryTarget: 'umd',
      publicPath: '/header',
    },
    plugins: [
      new CopyPlugin({
        patterns: [{from: path.join(__dirname, './header/index.css')}],
      }),
    ],
  }),
  merge(webpackBaseConfig, {
    entry: path.join(__dirname, './main/index.tsx'),
    externals: {
      react: 'react',
    },
    output: {
      path: path.join(websiteBuildDirname, 'main'),
      filename: 'feature-app-main.umd.js',
      libraryTarget: 'umd',
      publicPath: '/main',
    },
  }),
  mergeWithRules({
    module: {
      rules: {
        test: /** @type {import('webpack-merge').CustomizeRule.Match} */ ('match'),
        use: /** @type {import('webpack-merge').CustomizeRule.Replace} */ ('replace'),
      },
    },
  })(webpackBaseConfig, {
    entry: path.join(__dirname, './footer/index.tsx'),
    externals: {
      react: 'react',
    },
    output: {
      path: path.join(websiteBuildDirname, 'footer'),
      filename: 'feature-app-footer.umd.js',
      libraryTarget: 'umd',
      publicPath: '/footer',
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
                modules: {
                  localIdentName: '[path][name]__[local]--[hash:base64:5]',
                },
                sourceMap: true,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [['postcss-preset-env']],
                },
              },
            },
          ],
        },
      ],
    },
  }),
  merge(webpackBaseConfig, {
    entry: path.join(__dirname, './integrator.tsx'),
    output: {
      path: websiteBuildDirname,
      filename: 'integrator.js',
      publicPath: '/',
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          path.join(__dirname, './index.css'),
          path.join(__dirname, './index.html'),
        ],
      }),
    ],
  }),
];

module.exports = configs;
