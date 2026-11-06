// @ts-check
const path = require('path');
const {ModuleFederationPlugin} = require('@module-federation/enhanced');
const {merge} = require('webpack-merge');
const {webpackBaseConfig} = require('../webpack-base-config');

/**
 * Builds the remotes and integrator with `@module-federation/enhanced`'s
 * `ModuleFederationPlugin` (not webpack's built-in one), which initializes the
 * MF2 runtime `loadFederationModule` uses so `react` is shared across the
 * boundary. Each remote gets its own output dir and public path so their
 * `remoteEntry.js` files don't collide in the dev server's in-memory fs.
 *
 * @type {import('webpack').Configuration[]}
 */
const configs = [
  merge(webpackBaseConfig, {
    entry: {},
    output: {
      path: path.join(__dirname, 'dist', 'remotes'),
      publicPath: '/remotes/',
      uniqueName: 'remotes',
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'feature_apps',
        filename: 'remoteEntry.js',
        dts: false,
        exposes: {
          './featureAppModuleOne': path.join(__dirname, './feature-app-1'),
          './feature/two': path.join(__dirname, './feature-app-2'),
        },
        shared: {
          react: {singleton: true},
          '@blueprintjs/core': {},
        },
        // Required for `loadFederationModule` to find the MF2 runtime manifest, which
        // is used to initialize the MF2 runtime so `react` is shared across the
        // boundary.
        manifest: true,
      }),
    ],
  }),
  merge(webpackBaseConfig, {
    entry: path.join(__dirname, './integrator.tsx'),
    output: {
      path: path.join(__dirname, 'dist', 'integrator'),
      filename: 'integrator.js',
      publicPath: '/',
      uniqueName: 'integrator',
    },
    plugins: [
      new ModuleFederationPlugin({
        name: 'integrator',
        dts: false,
        shared: {
          react: {singleton: true, eager: true},
        },
      }),
    ],
  }),
];

module.exports = configs;
