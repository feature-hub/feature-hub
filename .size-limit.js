// @ts-check

module.exports = [
  {
    name: 'async-ssr-manager',
    path: 'packages/async-ssr-manager/lib/esm/index.js',
    limit: '0.7 KB',
    import: '*',
    modifyWebpackConfig: (config) => ({...config, target: 'node'}),
  },
  {
    name: 'core',
    path: 'packages/core/lib/esm/index.js',
    limit: '9.5 KB',
    import: '*',
  },
  {
    name: 'dom',
    path: 'packages/dom/lib/esm/index.js',
    limit: '7.3 KB',
    import: '*',
  },
  {
    name: 'history-service',
    path: 'packages/history-service/lib/esm/index.js',
    limit: '4 KB',
    import: '*',
    ignore: ['history'],
  },
  {
    name: 'logger',
    path: 'packages/logger/lib/esm/index.js',
    limit: '0.3 KB',
    import: '*',
  },
  {
    name: 'module-loader-amd',
    path: 'packages/module-loader-amd/lib/esm/index.js',
    limit: '3.8 KB',
    import: '*',
  },
  {
    name: 'module-loader-federation',
    path: 'packages/module-loader-federation/lib/esm/index.js',
    limit: '0.6 KB',
    import: '*',
  },
  {
    name: 'react',
    path: 'packages/react/lib/esm/index.js',
    limit: '2.6 KB',
    import: '*',
    ignore: ['react'],
  },
  {
    name: 'serialized-state-manager',
    path: 'packages/serialized-state-manager/lib/esm/index.js',
    limit: '0.5 KB',
    import: '*',
  },
  {
    name: 'server-request',
    path: 'packages/server-request/lib/esm/index.js',
    limit: '0.3 KB',
    import: '*',
  },
];
