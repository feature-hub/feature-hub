/**
 * @jest-environment node
 */

import {
  AsyncValue,
  FeatureAppDefinition,
  FeatureAppManagerLike
} from '@feature-hub/feature-app-manager';
import {shallow} from 'enzyme';
import * as React from 'react';
import {FeatureAppLoader} from '..';

describe('FeatureAppLoader (on the server)', () => {
  let mockManager: FeatureAppManagerLike;
  let mockGetAsyncFeatureAppDefinition: jest.Mock;
  let mockAsyncFeatureAppDefinition: AsyncValue<FeatureAppDefinition<unknown>>;
  let spyConsoleError: jest.SpyInstance;

  beforeEach(() => {
    mockAsyncFeatureAppDefinition = new AsyncValue(new Promise(jest.fn()));

    mockGetAsyncFeatureAppDefinition = jest.fn(
      () => mockAsyncFeatureAppDefinition
    );

    mockManager = {
      getAsyncFeatureAppDefinition: mockGetAsyncFeatureAppDefinition,
      getFeatureAppScope: jest.fn(),
      preloadFeatureApp: jest.fn(),
      destroy: jest.fn()
    };

    spyConsoleError = jest.spyOn(console, 'error');
    spyConsoleError.mockImplementation(jest.fn());
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  describe('when the async feature app definition synchronously has an error', () => {
    let mockError: Error;

    beforeEach(() => {
      mockError = new Error('Failed to load feature app module.');
      mockAsyncFeatureAppDefinition.error = mockError;
    });

    it('logs and re-throws the error', () => {
      expect(() =>
        shallow(
          <FeatureAppLoader
            manager={mockManager}
            src="example.js"
            featureAppKey="testKey"
          />
        )
      ).toThrowError(mockError);

      expect(spyConsoleError.mock.calls).toEqual([
        [
          'The feature app for the url "example.js" and the key "testKey" could not be loaded.',
          mockError
        ]
      ]);
    });
  });
});
