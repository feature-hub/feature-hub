// @ts-check

module.exports = [
  {
    path: 'packages/async-ssr-manager/lib/esm/index.js',
    limit: '1 KB',
  },
  {
    path: 'packages/core/lib/esm/index.js',
    limit: '11 KB',
  },
  {
    path: 'packages/dom/lib/esm/index.js',
    limit: '10 KB',
  },
  {
    path: 'packages/history-service/lib/esm/index.js',
    limit: '4 KB',
    ignore: ['history'],
  },
  {
    path: 'packages/logger/lib/esm/index.js',
    limit: '1 KB',
  },
  {
    path: 'packages/module-loader-amd/lib/esm/index.js',
    limit: '8 KB',
  },
  {
    path: 'packages/module-loader-federation/lib/esm/index.js',
    limit: '1 KB',
  },
  {
    path: 'packages/react/lib/esm/index.js',
    limit: '3.1 KB',
    ignore: ['react'],
  },
  {
    path: 'packages/serialized-state-manager/lib/esm/index.js',
    limit: '1 KB',
  },
  {
    path: 'packages/server-request/lib/esm/index.js',
    limit: '1 KB',
  },
];
