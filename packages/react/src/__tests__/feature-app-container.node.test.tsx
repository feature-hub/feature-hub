/**
 * @jest-environment node
 */

// tslint:disable:no-implicit-dependencies

import {
  FeatureAppDefinition,
  FeatureAppManagerLike,
  FeatureAppScope
} from '@feature-hub/core';
import {shallow} from 'enzyme';
import * as React from 'react';
import {FeatureAppContainer} from '..';

describe('FeatureAppContainer (on Node.js)', () => {
  let mockManager: FeatureAppManagerLike;
  let mockGetFeatureAppScope: jest.Mock;
  let mockFeatureAppDefinition: FeatureAppDefinition<unknown>;
  let mockFeatureAppScope: FeatureAppScope;
  let spyConsoleError: jest.SpyInstance;

  beforeEach(() => {
    mockFeatureAppDefinition = {id: 'testId', create: jest.fn()};
    mockFeatureAppScope = {featureApp: {}, destroy: jest.fn()};
    mockGetFeatureAppScope = jest.fn(() => mockFeatureAppScope);

    mockManager = {
      getAsyncFeatureAppDefinition: jest.fn(),
      getFeatureAppScope: mockGetFeatureAppScope,
      preloadFeatureApp: jest.fn(),
      destroy: jest.fn()
    };

    spyConsoleError = jest.spyOn(console, 'error');
    spyConsoleError.mockImplementation(jest.fn());
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  for (const invalidFeatureApp of [
    undefined,
    null,
    {},
    {attachTo: 'foo'},
    {render: 'foo'}
  ]) {
    describe(`when an invalid feature app (${JSON.stringify(
      invalidFeatureApp
    )}) is created`, () => {
      beforeEach(() => {
        mockFeatureAppScope = {
          featureApp: invalidFeatureApp,
          destroy: jest.fn()
        };
      });

      it('logs and throws an error', () => {
        const expectedError = new Error(
          'Invalid feature app found. The feature app must be an object with either 1) a `render` method that returns a react element, or 2) an `attachTo` method that accepts a container DOM element.'
        );

        expect(() =>
          shallow(
            <FeatureAppContainer
              manager={mockManager}
              featureAppDefinition={mockFeatureAppDefinition}
            />
          )
        ).toThrowError(expectedError);

        expect(spyConsoleError.mock.calls).toEqual([[expectedError]]);
      });
    });
  }

  describe('when a feature app scope fails to be created', () => {
    let mockError: Error;

    beforeEach(() => {
      mockError = new Error('Failed to create feature app scope.');

      mockGetFeatureAppScope.mockImplementation(() => {
        throw mockError;
      });
    });

    it('logs and throws an error', () => {
      expect(() =>
        shallow(
          <FeatureAppContainer
            manager={mockManager}
            featureAppDefinition={mockFeatureAppDefinition}
          />
        )
      ).toThrowError(mockError);

      expect(spyConsoleError.mock.calls).toEqual([[mockError]]);
    });
  });
});
