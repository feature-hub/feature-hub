import {FeatureAppModuleLoader} from '@feature-hub/core';
import crypto from 'crypto';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import path from 'path';

// This must be a local directory to make node module resolution possible.
const cacheDirname = path.join(__dirname, '.cache');

function createHash(data: string): string {
  return crypto
    .createHash('md5')
    .update(data)
    .digest('hex');
}

async function writeFile(url: string, data: Buffer): Promise<string> {
  /* istanbul ignore next */
  if (!(await fs.pathExists(cacheDirname))) {
    await fs.mkdirp(cacheDirname);
  }

  const filename = path.join(cacheDirname, `${createHash(url)}.js`);

  await fs.writeFile(filename, data);

  return filename;
}

async function requireAsync(url: string): Promise<unknown> {
  const response = await fetch(url);
  const data = await response.buffer();
  const filename = await writeFile(url, data);

  return require(filename);
}

export const loadFeatureAppModule: FeatureAppModuleLoader = async (
  featureAppUrl: string
) => requireAsync(featureAppUrl);
