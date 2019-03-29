import {ModuleLoader} from '@feature-hub/core';
import crypto from 'crypto';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import path from 'path';

// This must be a local directory to make node module resolution possible.
const tmpDirname = path.join(__dirname, '.tmp');

function createHash(data: string): string {
  return crypto
    .createHash('md5')
    .update(data)
    .digest('hex');
}

async function writeFile(url: string, data: Buffer): Promise<string> {
  /* istanbul ignore next */
  if (!(await fs.pathExists(tmpDirname))) {
    await fs.mkdirp(tmpDirname);
  }

  const filename = path.join(tmpDirname, `${createHash(url)}.js`);

  await fs.writeFile(filename, data);

  return filename;
}

async function requireAsync(url: string): Promise<unknown> {
  const response = await fetch(url);
  const data = await response.buffer();
  const filename = await writeFile(url, data);

  // Make sure no stale version of the module is loaded from the require cache!
  // tslint:disable-next-line:no-dynamic-delete
  delete require.cache[require.resolve(filename)];

  return require(filename);
}

export const loadCommonJsModule: ModuleLoader = async url => requireAsync(url);
