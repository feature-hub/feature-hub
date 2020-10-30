/**
 * @jest-environment node
 */

// tslint:disable:no-implicit-dependencies

import {
  FeatureAppDefinition,
  FeatureAppManager,
  FeatureAppScope,
} from '@feature-hub/core';
import * as React from 'react';
import ReactDOM from 'react-dom/server';
import {FeatureApp, FeatureAppContainer, FeatureHubContextProvider} from '..';

describe('FeatureAppContainer (on Node.js)', () => {
  let mockFeatureAppManager: FeatureAppManager;
  let mockCreateFeatureAppScope: jest.Mock;
  let mockFeatureAppDefinition: FeatureAppDefinition<FeatureApp>;
  let mockFeatureAppScope: FeatureAppScope<unknown>;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  const expectConsoleErrorCalls = (expectedConsoleErrorCalls: unknown[][]) => {
    try {
      expect(consoleErrorSpy.mock.calls).toEqual(expectedConsoleErrorCalls);
    } finally {
      consoleErrorSpy.mockClear();
    }
  };

  beforeEach(() => {
    mockFeatureAppDefinition = {create: jest.fn()};
    mockFeatureAppScope = {featureApp: {}, release: jest.fn()};
    mockCreateFeatureAppScope = jest.fn(() => ({...mockFeatureAppScope}));

    mockFeatureAppManager = ({
      getAsyncFeatureAppDefinition: jest.fn(),
      createFeatureAppScope: mockCreateFeatureAppScope,
      preloadFeatureApp: jest.fn(),
    } as Partial<FeatureAppManager>) as FeatureAppManager;

    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleWarnSpy = jest.spyOn(console, 'warn');
  });

  afterEach(() => {
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();

    expect(consoleWarnSpy).not.toHaveBeenCalled();
    consoleWarnSpy.mockRestore();
  });

  const renderWithFeatureHubContext = (node: React.ReactNode) =>
    ReactDOM.renderToString(
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
    {render: 'foo'},
  ]) {
    describe(`when an invalid Feature App (${JSON.stringify(
      invalidFeatureApp
    )}) is created`, () => {
      beforeEach(() => {
        mockFeatureAppScope = {
          featureApp: invalidFeatureApp,
          release: jest.fn(),
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

      mockCreateFeatureAppScope.mockImplementation(() => {
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
          },
        },
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

  describe('when using a loading promise', () => {
    let resolveLoadingPromise: () => Promise<void>;
    let rejectLoadingPromise: (reason?: Error) => Promise<void>;

    beforeEach(() => {
      const loadingPromise: Promise<void> = new Promise((resolve, reject) => {
        resolveLoadingPromise = async () => {
          resolve();
          // promsise returns itself so we don't forget to await next
          // async tick in tests

          return loadingPromise;
        };
        rejectLoadingPromise = async (e?: Error) => {
          reject(e);

          return loadingPromise.catch(() => undefined);
        };
      });

      mockFeatureAppScope = {
        ...mockFeatureAppScope,
        featureApp: {
          loadingPromise,
          render: () => 'Rendered a Feature App',
        },
      };
    });

    it('renders with loading=true, resolved loading promise is ignored', async () => {
      const children = jest.fn(() => null);

      renderWithFeatureHubContext(
        <FeatureAppContainer
          featureAppId="testId"
          featureAppDefinition={mockFeatureAppDefinition}
          children={children}
        />
      );

      expect(children).toHaveBeenCalledTimes(1);
      expect(children.mock.calls[0]).toMatchObject([{loading: true}]);

      await resolveLoadingPromise();

      expect(children).toHaveBeenCalledTimes(1);
    });

    it('ignores a rejected loading promise', async () => {
      const children = jest.fn(() => null);

      renderWithFeatureHubContext(
        <FeatureAppContainer
          featureAppId="testId"
          featureAppDefinition={mockFeatureAppDefinition}
          children={children}
        />
      );

      expect(children).toHaveBeenCalledTimes(1);

      await rejectLoadingPromise();

      expect(children).toHaveBeenCalledTimes(1);
    });
  });
});
