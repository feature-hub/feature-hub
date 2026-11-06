import {federation} from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  base: '/remotes/',
  plugins: [
    react(),
    federation({
      name: 'vite-feature-apps',
      filename: 'remoteEntry.js',
      dts: false,

      exposes: {
        './feature/one': './feature-app-1.tsx',
        './featureTwo': './feature-app-2.tsx',
      },
      // `singleton` dedupes React with the host; without it the remote loads
      // its own copy and hooks fail with a null dispatcher.
      shared: {
        react: {singleton: true, requiredVersion: '^18.0.0'},
        'react-dom': {singleton: true, requiredVersion: '^18.0.0'},
      },
      // Generate a manifest for the MF2 runtime to consume, so the integrator can
      // load the remote without knowing its entry URL or exposed modules up front.
      manifest: true,
    }),
  ],
  build: {
    target: 'chrome89',
    outDir: 'dist-remote',
    minify: false,
    modulePreload: false,
    cssCodeSplit: false,
    // No HTML shell to use as an entry; seed the build with an exposed module.
    rollupOptions: {input: './feature-app-1.tsx'},
  },
});
