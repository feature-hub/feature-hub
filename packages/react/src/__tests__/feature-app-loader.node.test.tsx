/**
 * @jest-environment node
 */

// tslint:disable:no-implicit-dependencies

import {AsyncSsrManagerV0} from '@feature-hub/async-ssr-manager';
import {
  AsyncValue,
  FeatureAppDefinition,
  FeatureAppManagerLike
} from '@feature-hub/core';
import {shallow} from 'enzyme';
import * as React from 'react';
import {FeatureAppLoader} from '..';

interface MockAsyncSsrManager extends AsyncSsrManagerV0 {
  rerenderAfter: ((promise: Promise<unknown>) => void) & jest.Mock;
}

describe('FeatureAppLoader (on Node.js)', () => {
  let mockFeatureAppManager: FeatureAppManagerLike;
  let mockGetAsyncFeatureAppDefinition: jest.Mock;
  let mockAsyncFeatureAppDefinition: AsyncValue<FeatureAppDefinition<unknown>>;
  let mockAsyncSsrManager: MockAsyncSsrManager;
  let spyConsoleError: jest.SpyInstance;

  beforeEach(() => {
    mockAsyncFeatureAppDefinition = new AsyncValue(
      new Promise<FeatureAppDefinition<unknown>>(jest.fn())
    );

    mockGetAsyncFeatureAppDefinition = jest.fn(
      () => mockAsyncFeatureAppDefinition
    );

    mockFeatureAppManager = {
      getAsyncFeatureAppDefinition: mockGetAsyncFeatureAppDefinition,
      getFeatureAppScope: jest.fn(),
      preloadFeatureApp: jest.fn(),
      destroy: jest.fn()
    };

    mockAsyncSsrManager = {
      rerender: jest.fn(),
      rerenderAfter: jest.fn(),
      renderUntilCompleted: jest.fn()
    };

    spyConsoleError = jest.spyOn(console, 'error');
    spyConsoleError.mockImplementation(jest.fn());
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
  });

  describe('without a serverSrc', () => {
    it('does not try to load a Feature App definition', () => {
      shallow(
        <FeatureAppLoader
          featureAppManager={mockFeatureAppManager}
          src="example.js"
        />,
        {disableLifecycleMethods: true}
      );

      expect(mockGetAsyncFeatureAppDefinition).not.toHaveBeenCalled();
    });

    it('does not trigger a rerender on the Async SSR Manager', () => {
      shallow(
        <FeatureAppLoader
          featureAppManager={mockFeatureAppManager}
          src="example.js"
          asyncSsrManager={mockAsyncSsrManager}
        />,
        {disableLifecycleMethods: true}
      );

      expect(mockAsyncSsrManager.rerenderAfter).not.toHaveBeenCalled();
    });
  });

  describe('with a serverSrc', () => {
    it('loads a Feature App definition for the serverSrc', () => {
      shallow(
        <FeatureAppLoader
          featureAppManager={mockFeatureAppManager}
          src="example.js"
          serverSrc="example-node.js"
        />,
        {disableLifecycleMethods: true}
      );

      expect(mockGetAsyncFeatureAppDefinition.mock.calls).toEqual([
        ['example-node.js']
      ]);
    });

    it('triggers a rerender on the Async SSR Manager with the feature app definition promise', () => {
      shallow(
        <FeatureAppLoader
          featureAppManager={mockFeatureAppManager}
          src="example.js"
          serverSrc="example-node.js"
          asyncSsrManager={mockAsyncSsrManager}
        />,
        {disableLifecycleMethods: true}
      );

      expect(mockAsyncSsrManager.rerenderAfter.mock.calls).toEqual([
        [mockAsyncFeatureAppDefinition.promise]
      ]);
    });

    describe('when a Feature App definition is synchronously available', () => {
      let mockFeatureAppDefinition: FeatureAppDefinition<unknown>;

      beforeEach(() => {
        mockFeatureAppDefinition = {
          id: 'testId',
          create: jest.fn()
        };

        mockAsyncFeatureAppDefinition = new AsyncValue(
          Promise.resolve(mockFeatureAppDefinition)
        );
      });

      it('does not trigger a rerender on the Async SSR Manager', () => {
        shallow(
          <FeatureAppLoader
            featureAppManager={mockFeatureAppManager}
            src="example.js"
            serverSrc="example-node.js"
            asyncSsrManager={mockAsyncSsrManager}
          />,
          {disableLifecycleMethods: true}
        );

        expect(mockAsyncSsrManager.rerenderAfter).not.toHaveBeenCalled();
      });
    });

    describe('when the async Feature App definition synchronously has an error', () => {
      let mockError: Error;

      beforeEach(() => {
        mockError = new Error('Failed to load Feature App module.');
        mockAsyncFeatureAppDefinition.error = mockError;
      });

      it('logs and re-throws the error', () => {
        expect(() =>
          shallow(
            <FeatureAppLoader
              featureAppManager={mockFeatureAppManager}
              src="example.js"
              serverSrc="example-node.js"
              idSpecifier="testIdSpecifier"
            />,
            {disableLifecycleMethods: true}
          )
        ).toThrowError(mockError);

        expect(spyConsoleError.mock.calls).toEqual([
          [
            'The Feature App for the src "example-node.js" and the ID specifier "testIdSpecifier" could not be rendered.',
            mockError
          ]
        ]);
      });

      it('does not trigger a rerender on the Async SSR Manager', () => {
        try {
          shallow(
            <FeatureAppLoader
              featureAppManager={mockFeatureAppManager}
              src="example.js"
              serverSrc="example-node.js"
              asyncSsrManager={mockAsyncSsrManager}
            />,
            {disableLifecycleMethods: true}
          );
        } catch {}

        expect(mockAsyncSsrManager.rerenderAfter).not.toHaveBeenCalled();
      });
    });
  });
});
