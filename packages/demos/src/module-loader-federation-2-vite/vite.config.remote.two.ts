import {federation} from '@module-federation/vite';
import react from '@vitejs/plugin-react';
import {defineConfig} from 'vite';

export default defineConfig({
  base: '/remotes-2/',
  plugins: [
    react(),
    federation({
      // Validates that the same remote name does not break the MF2 loader.
      name: 'vite-feature-apps',
      filename: 'remoteEntry.js',
      dts: false,

      exposes: {
        // purposefully using the same name as the other remote to test that the loader
        // can handle two remotes with the same name but different entry URLs.
        './feature/one': './feature-app-1.tsx',
        './feature/three': './feature-app-3.tsx',
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
    outDir: 'dist-remote-2',
    minify: false,
    modulePreload: false,
    cssCodeSplit: false,
    // No HTML shell to use as an entry; seed the build with an exposed module.
    rollupOptions: {input: './feature-app-3.tsx'},
  },
});
