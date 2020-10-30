/**
 * @jest-environment node
 */

import {RequestInit} from 'node-fetch';
import {createCommonJsModuleLoader, loadCommonJsModule} from '..';

let mockResponse: string;
let requestUrl: RequestInfo;
let requestInit: RequestInit;

// tslint:disable promise-function-async
jest.mock('node-fetch', () => (url: RequestInfo, init: RequestInit) => {
  requestUrl = url;
  requestInit = init;

  return Promise.resolve({
    text: () => Promise.resolve(Buffer.from(mockResponse)),
  });
});
// tslint:enable promise-function-async

describe('loadCommonJsModule (on Node.js)', () => {
  it('when a module is fetched successfully', async () => {
    const url = 'http://example.com/test.js';

    mockResponse = `
      var semver = require('semver');
      module.exports = {
        default: {test: semver.coerce('1').version}
      };
    `;

    const loadedModule = await loadCommonJsModule(url);
    const expectedModule = {default: {test: '1.0.0'}};

    expect(loadedModule).toEqual(expectedModule);
  });
});

describe('createCommonJsModuleLoader', () => {
  it('creates a CommonJS module loader with custom-defined externals', async () => {
    const url = 'http://example.com/test.js';
    const init: RequestInit = {method: 'post'};

    mockResponse = `
      var foo = require('foo');
      module.exports = {
        default: {test: foo()}
      };
    `;

    const loadCommonJsModuleWithExternals = createCommonJsModuleLoader(
      {foo: () => 42},
      init
    );

    const loadedModule = await loadCommonJsModuleWithExternals(url);
    const expectedModule = {default: {test: 42}};

    expect(loadedModule).toEqual(expectedModule);
    expect(requestUrl).toEqual(url);
    expect(requestInit).toEqual(init);
  });
});
