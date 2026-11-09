import {federation} from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import {defaultClientConditions, defineConfig} from 'vite';

export default defineConfig({
  base: '/',
  // Resolve the Feature Hub packages to their sources, as the webpack demos do,
  // rather than to a `lib` build that may be stale.
  resolve: {conditions: ['@feature-hub:bundler', ...defaultClientConditions]},
  plugins: [
    react(),
    federation({
      name: 'integrator',
      dts: false,
      // Remotes are loaded dynamically via `loadFederationModule`, not here.
      remotes: {},
      shared: {
        react: {singleton: true, requiredVersion: '^18.0.0'},
        'react-dom': {singleton: true, requiredVersion: '^18.0.0'},
      },
    }),
  ],
  build: {
    target: 'chrome89',
    outDir: 'dist-host',
    minify: false,
    modulePreload: false,
  },
});
