// @ts-check
const {spawnSync} = require('child_process');
const fs = require('fs');
const path = require('path');

const staticMounts = [
  {route: '/remotes', dir: path.join(__dirname, 'dist-remote')},
  {route: '/remotes-2', dir: path.join(__dirname, 'dist-remote-2')},
  {route: '/', dir: path.join(__dirname, 'dist-host')},
];

/**
 * Builds the Vite host and remote and returns where to serve each `dist`. With
 * `watch` (used by `watch-demo.js`) it rebuilds on change; refresh to see it.
 *
 * @param {{watch?: boolean}} [options]
 * @return {Promise<{staticMounts: {route: string, dir: string}[]}>}
 */
async function prepare({watch = false} = {}) {
  if (watch) {
    buildAndWatch();
  } else {
    buildOnce();
  }

  return {staticMounts};
}

// Runs in a child process because Vite is ESM-only and Jest's CommonJS VM
// cannot `import()` it.
function buildOnce() {
  // `@module-federation/vite` skips the `remoteEntry.js` container under a test
  // env (`NODE_ENV=test` or `JEST_WORKER_ID`, both set by Jest), so scrub both.
  /** @type {NodeJS.ProcessEnv} */
  const env = {...process.env, NODE_ENV: 'production'};
  delete env.JEST_WORKER_ID;

  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, 'build-remotes.mjs')],
    {stdio: 'inherit', env},
  );

  if (result.status !== 0) {
    throw new Error(`Vite build failed (exit code ${result.status}).`);
  }
}

// Rebuilds by re-running the one-shot build on change. Vite's own `build.watch`
// can't resolve `@module-federation/vite`'s host auto-init entry, so avoid it.
function buildAndWatch() {
  buildOnce();

  /** @type {ReturnType<typeof setTimeout> | null} */
  let timer = null;

  fs.watch(__dirname, {recursive: true}, (_event, filename) => {
    if (!filename || filename.startsWith('dist-')) {
      return;
    }

    if (!/\.(tsx?|html|mjs)$/.test(filename)) {
      return;
    }

    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      try {
        buildOnce();
        // eslint-disable-next-line no-console
        console.log(`[watch] rebuilt after change to ${filename}`);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`[watch] rebuild failed: ${String(error)}`);
      }
    }, 150);
  });
}

module.exports = {prepare};
