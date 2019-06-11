/**
 * @jest-environment node
 */

// tslint:disable:no-implicit-dependencies

import {
  FeatureAppDefinition,
  FeatureAppManager,
  FeatureAppScope
} from '@feature-hub/core';
import {Stubbed, stubMethods} from 'jest-stub-methods';
import * as React from 'react';
import TestRenderer from 'react-test-renderer';
import {FeatureApp, FeatureAppContainer, FeatureHubContextProvider} from '..';

describe('FeatureAppContainer (on Node.js)', () => {
  let mockFeatureAppManager: FeatureAppManager;
  let mockGetFeatureAppScope: jest.Mock;
  let mockFeatureAppDefinition: FeatureAppDefinition<FeatureApp>;
  let mockFeatureAppScope: FeatureAppScope<unknown>;
  let stubbedConsole: Stubbed<Console>;

  const expectConsoleErrorCalls = (expectedConsoleErrorCalls: unknown[][]) => {
    try {
      expect(stubbedConsole.stub.error.mock.calls).toEqual(
        expectedConsoleErrorCalls
      );
    } finally {
      stubbedConsole.stub.error.mockClear();
    }
  };

  beforeEach(() => {
    mockFeatureAppDefinition = {create: jest.fn()};
    mockFeatureAppScope = {featureApp: {}, destroy: jest.fn()};
    mockGetFeatureAppScope = jest.fn(() => mockFeatureAppScope);

    mockFeatureAppManager = ({
      getAsyncFeatureAppDefinition: jest.fn(),
      getFeatureAppScope: mockGetFeatureAppScope,
      preloadFeatureApp: jest.fn()
    } as Partial<FeatureAppManager>) as FeatureAppManager;

    stubbedConsole = stubMethods(console);
  });

  afterEach(() => {
    expect(stubbedConsole.stub.error).not.toHaveBeenCalled();
    stubbedConsole.restore();
  });

  const renderWithFeatureHubContext = (node: React.ReactNode) =>
    TestRenderer.create(
      <FeatureHubContextProvider
        value={{featureAppManager: mockFeatureAppManager}}
      >
        {node}
      </FeatureHubContextProvider>
    );

  for (const invalidFeatureApp of [
    undefined,
    null,
    {},
    {attachTo: 'foo'},
    {render: 'foo'}
  ]) {
    describe(`when an invalid Feature App (${JSON.stringify(
      invalidFeatureApp
    )}) is created`, () => {
      beforeEach(() => {
        mockFeatureAppScope = {
          featureApp: invalidFeatureApp,
          destroy: jest.fn()
        };
      });

      it('logs an error', () => {
        const expectedError = new Error(
          'Invalid Feature App found. The Feature App must be an object with either 1) a `render` method that returns a React element, or 2) an `attachTo` method that accepts a container DOM element.'
        );

        renderWithFeatureHubContext(
          <FeatureAppContainer
            featureAppId="testId"
            featureAppDefinition={mockFeatureAppDefinition}
          />
        );

        expectConsoleErrorCalls([[expectedError]]);
      });
    });
  }

  describe('when a Feature App scope fails to be created', () => {
    let mockError: Error;

    beforeEach(() => {
      mockError = new Error('Failed to create Feature App scope.');

      mockGetFeatureAppScope.mockImplementation(() => {
        throw mockError;
      });
    });

    it('logs an error', () => {
      renderWithFeatureHubContext(
        <FeatureAppContainer
          featureAppId="testId"
          featureAppDefinition={mockFeatureAppDefinition}
        />
      );

      expectConsoleErrorCalls([[mockError]]);
    });
  });

  describe('when a Feature App throws in render', () => {
    let mockError: Error;

    beforeEach(() => {
      mockError = new Error('Failed to render.');

      mockFeatureAppScope = {
        ...mockFeatureAppScope,
        featureApp: {
          render: () => {
            throw mockError;
          }
        }
      };
    });

    it('logs the error', () => {
      renderWithFeatureHubContext(
        <FeatureAppContainer
          featureAppId="testId"
          featureAppDefinition={mockFeatureAppDefinition}
        />
      );

      expectConsoleErrorCalls([[mockError]]);
    });
  });
});
