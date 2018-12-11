/**
 * @jest-environment node
 */

// tslint:disable:no-implicit-dependencies

import {
  AsyncValue,
  FeatureAppDefinition,
  FeatureAppManagerLike
} from '@feature-hub/core';
import {shallow} from 'enzyme';
import * as React from 'react';
import {FeatureAppLoader} from '..';

describe('FeatureAppLoader (on Node.js)', () => {
  let mockManager: FeatureAppManagerLike;
  let mockGetAsyncFeatureAppDefinition: jest.Mock;
  let mockAsyncFeatureAppDefinition: AsyncValue<FeatureAppDefinition<unknown>>;
  let spyConsoleError: jest.SpyInstance;

  beforeEach(() => {
    mockAsyncFeatureAppDefinition = new AsyncValue(
      new Promise<FeatureAppDefinition<unknown>>(jest.fn())
    );

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

  describe('without a nodeSrc', () => {
    it('does not try to load a feature app definition', () => {
      shallow(<FeatureAppLoader manager={mockManager} src="example.js" />, {
        disableLifecycleMethods: true
      });

      expect(mockGetAsyncFeatureAppDefinition).not.toHaveBeenCalled();
    });
  });

  describe('with a nodeSrc', () => {
    it('loads a feature app definition for the nodeSrc', () => {
      shallow(
        <FeatureAppLoader
          manager={mockManager}
          src="example.js"
          nodeSrc="example-node.js"
        />,
        {
          disableLifecycleMethods: true
        }
      );

      expect(mockGetAsyncFeatureAppDefinition.mock.calls).toEqual([
        ['example-node.js']
      ]);
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
              nodeSrc="example-node.js"
              idSpecifier="testIdSpecifier"
            />,
            {
              disableLifecycleMethods: true
            }
          )
        ).toThrowError(mockError);

        expect(spyConsoleError.mock.calls).toEqual([
          [
            'The feature app for the src "example-node.js" and the ID specifier "testIdSpecifier" could not be loaded.',
            mockError
          ]
        ]);
      });
    });
  });
});
