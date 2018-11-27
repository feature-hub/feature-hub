let mockResponse: string;

// tslint:disable promise-function-async
jest.mock('node-fetch', () => () =>
  Promise.resolve({
    buffer: () => Promise.resolve(Buffer.from(mockResponse))
  })
);
// tslint:enable promise-function-async

import {loadCommonJsModule} from '../node';

describe('loadCommonJsModule', () => {
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
