// @ts-check

import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import {terser} from 'rollup-plugin-terser';

/**
 * @type {import('rollup').RollupOptions}
 */
const config = {
  input: 'src/polyfills.js',
  output: {
    format: 'iife',
    file: 'lib/polyfills.js',
    name: 'featureHubPolyfills'
  },
  plugins: [
    // @ts-ignore
    nodeResolve(),
    // @ts-ignore
    commonjs(),
    terser()
  ]
};

export default config;
