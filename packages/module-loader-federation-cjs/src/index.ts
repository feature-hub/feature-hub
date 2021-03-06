import crypto from 'crypto';
import extract from 'extract-zip';
import {promises as fsp} from 'fs';
import fetch from 'node-fetch';
import path from 'path';

const md5sum = crypto.createHash('md5');

function loadComponent(
  container: GlobalScope,
  module: string,
  _webpackInitSharing: WebpackInitSharing,
  webpackShareScopes: WebpackShareScopes,
  options: {
    basePath: string;
    shareScopeName: string;
  }
): () => Promise<unknown> {
  return async () => {
    // Initializes the share scope. This fills it with known provided modules from this build and all remotes
    // needs to be done by integrator
    // await webpackInitSharing('default');

    // Initialize the container, it may provide shared modules
    // if (options.firstRender) {
    await container.init(webpackShareScopes[options.shareScopeName]);
    //}
    const factory = await container.get(module);
    const Module = factory();

    return Module;
  };
}

async function load(
  url: string,
  options: {basePath: string}
): Promise<GlobalScope> {
  const response = await fetch(url);
  console.log('url is ', url);
  const source = await response.buffer();

  const time = new Date().toUTCString();
  const folder = 'fa_' + md5sum.update(url + time).digest('hex');
  const targetDir = path.join(options.basePath, folder);

  try {
    const stat = await fsp.stat(targetDir);
    console.log('creating dir ', stat);
  } catch (error) {
    await fsp.mkdir(targetDir);
  }

  console.log('targetDir ' + targetDir);

  const zipFile = path.join(targetDir, 'bundle.zip');
  const fileHandle = await fsp.open(zipFile, 'w');
  try {
    await fileHandle.write(source);
  } finally {
    await fileHandle.close();
  }
  console.log('file written');
  await extract(zipFile, {
    dir: targetDir,
  });
  console.log('extracted');
  // tslint:disable-next-line: no-eval
  const container = eval('require')(path.join(targetDir, 'remoteEntry.js'));

  return container;
}

type SharedModules = unknown;

export type WebpackInitSharing = (name: string) => Promise<void>;
export interface WebpackShareScopes {
  [key: string]: SharedModules;
}
export interface GlobalScope {
  get: (module: string) => Promise<() => unknown>;
  init: (sharedModules: SharedModules) => Promise<void>;
}

export const loadFederationModuleSsrFactory = (
  webpackInitSharing: WebpackInitSharing,
  webpackShareScopes: WebpackShareScopes,
  options: {
    basePath: string;
    shareScopeName: string;
    cache: Map<string, unknown>;
  }
) => async (url: string) => {
  const {cache, basePath = '/tmp', shareScopeName = 'default'} = options;

  return new Promise(async (resolve, reject) => {
    if (cache.has(url)) {
      console.log('###CACHE HIT');
      resolve(cache.get(url));

      return;
    }
    const container = await load(url, options);
    console.log(`Dynamic Script Loaded: ${url}`);
    loadComponent(
      container,
      './featureAppDefinition',
      webpackInitSharing,
      webpackShareScopes,
      {basePath, shareScopeName}
    )()
      .then((module) => {
        console.log('### set cache');
        cache.set(url, module);
        resolve(module);
      })
      .catch(reject);
  });
};
