// @ts-nocheck
// Builds the Vite host and remote. Run as a child process by `prepare.js` so
// the ESM-only Vite API works even from Jest's CommonJS VM.
import path from 'node:path';
import {fileURLToPath} from 'node:url';

// Pin production before Vite loads (a test env suppresses the `remoteEntry.js`
// container). Vite is imported dynamically so this runs first — static imports
// are hoisted, this statement is not.
process.env.NODE_ENV = 'production';

const {build} = await import('vite');

const dirname = path.dirname(fileURLToPath(import.meta.url));

for (const configFile of [
  'vite.config.remote.ts',
  'vite.config.remote.two.ts',
  'vite.config.host.ts',
]) {
  await build({
    configFile: path.join(dirname, configFile),
    root: dirname,
    logLevel: 'warn',
  });
}
