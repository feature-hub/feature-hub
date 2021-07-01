/**
 * @jest-environment node
 */

// tslint:disable:no-implicit-dependencies

import {AsyncSsrManagerV1} from '@feature-hub/async-ssr-manager';
import {
  AsyncValue,
  FeatureAppDefinition,
  FeatureAppManager,
} from '@feature-hub/core';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
import {FeatureAppLoader, FeatureHubContextProvider} from '..';

interface MockAsyncSsrManager extends AsyncSsrManagerV1 {
  scheduleRerender: ((promise: Promise<unknown>) => void) & jest.Mock;
}

jest.mock('../feature-app-container', () => ({
  FeatureAppContainer: jest.fn(() => 'mocked FeatureAppContainer'),
}));

describe('FeatureAppLoader (on Node.js)', () => {
  let mockFeatureAppManager: FeatureAppManager;
  let mockGetAsyncFeatureAppDefinition: jest.Mock;
  let mockAsyncFeatureAppDefinition: AsyncValue<FeatureAppDefinition<unknown>>;
  let mockAsyncSsrManager: MockAsyncSsrManager;
  let mockAddUrlForHydration: jest.Mock;
  let mockAddStylesheetsForSsr: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockAsyncFeatureAppDefinition = new AsyncValue(
      new Promise<FeatureAppDefinition<unknown>>(jest.fn())
    );

    mockGetAsyncFeatureAppDefinition = jest.fn(
      () => mockAsyncFeatureAppDefinition
    );

    mockFeatureAppManager = ({
      getAsyncFeatureAppDefinition: mockGetAsyncFeatureAppDefinition,
      createFeatureAppScope: jest.fn(),
      preloadFeatureApp: jest.fn(),
    } as Partial<FeatureAppManager>) as FeatureAppManager;

    mockAsyncSsrManager = {
      scheduleRerender: jest.fn(),
      renderUntilCompleted: jest.fn(),
    };

    mockAddUrlForHydration = jest.fn();
    mockAddStylesheetsForSsr = jest.fn();

    consoleErrorSpy = jest.spyOn(console, 'error');
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  const renderWithFeatureHubContext = (node: React.ReactNode) =>
    ReactDOM.renderToString(
      <FeatureHubContextProvider
        value={{
          featureAppManager: mockFeatureAppManager,
          asyncSsrManager: mockAsyncSsrManager,
          addUrlForHydration: mockAddUrlForHydration,
          addStylesheetsForSsr: mockAddStylesheetsForSsr,
        }}
      >
        {node}
      </FeatureHubContextProvider>
    );

  describe('without a serverSrc', () => {
    it('does not try to load a Feature App definition', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader featureAppId="testId" src="example.js" />
      );

      expect(mockGetAsyncFeatureAppDefinition).not.toHaveBeenCalled();
    });

    it('does not schedule a rerender on the Async SSR Manager', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader featureAppId="testId" src="example.js" />
      );

      expect(mockAsyncSsrManager.scheduleRerender).not.toHaveBeenCalled();
    });

    it('does not add a URL for hydration', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader featureAppId="testId" src="example.js" />
      );

      expect(mockAddUrlForHydration).not.toHaveBeenCalled();
    });
  });

  describe('with a serverSrc', () => {
    it('loads a Feature App definition for the serverSrc', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader
          featureAppId="testId"
          src="example.js"
          serverSrc="example-node.js"
        />
      );

      expect(mockGetAsyncFeatureAppDefinition.mock.calls).toEqual([
        ['example-node.js', undefined],
      ]);
    });

    describe('with a baseUrl', () => {
      it('loads a Feature App definition for the prepended serverSrc', () => {
        renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            baseUrl="http://example.com"
            src="example.js"
            serverSrc="example-node.js"
          />
        );

        expect(mockGetAsyncFeatureAppDefinition.mock.calls).toEqual([
          ['http://example.com/example-node.js', undefined],
        ]);
      });

      it('adds the prepended src URL and moduleType for hydration', () => {
        renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            baseUrl="http://example.com"
            src="example.js"
            serverSrc="example-node.js"
            moduleType="a"
            serverModuleType="b"
          />
        );

        expect(mockAddUrlForHydration).toHaveBeenCalledWith(
          'http://example.com/example.js',
          'a'
        );
      });
    });

    it('schedules a rerender on the Async SSR Manager with the feature app definition promise', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader
          featureAppId="testId"
          src="example.js"
          serverSrc="example-node.js"
        />
      );

      expect(mockAsyncSsrManager.scheduleRerender.mock.calls).toEqual([
        [mockAsyncFeatureAppDefinition.promise],
      ]);
    });

    it('adds the src URL for hydration', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader
          featureAppId="testId"
          src="example.js"
          serverSrc="example-node.js"
        />
      );

      expect(mockAddUrlForHydration).toHaveBeenCalledWith(
        'example.js',
        undefined
      );
    });

    describe('with a moduleType prop', () => {
      it('calls getAsyncFeatureAppDefinition with the given src and moduleType', () => {
        renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            src="example.js"
            serverSrc="example-node.js"
            moduleType="a"
            serverModuleType="b"
          />
        );

        expect(mockGetAsyncFeatureAppDefinition.mock.calls).toEqual([
          ['example-node.js', 'b'],
        ]);
      });
    });

    describe('when a Feature App definition is synchronously available', () => {
      let mockFeatureAppDefinition: FeatureAppDefinition<unknown>;

      beforeEach(() => {
        mockFeatureAppDefinition = {create: jest.fn()};

        mockAsyncFeatureAppDefinition = new AsyncValue(
          Promise.resolve(mockFeatureAppDefinition)
        );
      });

      it('does not schedule a rerender on the Async SSR Manager', () => {
        renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            src="example.js"
            serverSrc="example-node.js"
          />
        );

        expect(mockAsyncSsrManager.scheduleRerender).not.toHaveBeenCalled();
      });
    });

    describe('when the async Feature App definition synchronously has an error', () => {
      let mockError: Error;

      beforeEach(() => {
        mockError = new Error('Failed to load Feature App module.');
        mockAsyncFeatureAppDefinition.error = mockError;
      });

      it('logs the error', () => {
        renderWithFeatureHubContext(
          <FeatureAppLoader
            src="example.js"
            serverSrc="example-node.js"
            featureAppId="testId"
          />
        );

        expect(consoleErrorSpy.mock.calls).toEqual([
          [
            'The Feature App for the src "example-node.js" and the ID "testId" could not be rendered.',
            mockError,
          ],
        ]);
      });

      it('does not schedule a rerender on the Async SSR Manager', () => {
        try {
          renderWithFeatureHubContext(
            <FeatureAppLoader
              featureAppId="testId"
              src="example.js"
              serverSrc="example-node.js"
            />
          );
        } catch {}

        expect(mockAsyncSsrManager.scheduleRerender).not.toHaveBeenCalled();
      });

      it('adds the src URL for hydration', () => {
        try {
          renderWithFeatureHubContext(
            <FeatureAppLoader
              featureAppId="testId"
              src="example.js"
              serverSrc="example-node.js"
            />
          );
        } catch {}

        expect(mockAddUrlForHydration).toHaveBeenCalledWith(
          'example.js',
          undefined
        );
      });
    });
  });

  describe('without a css prop', () => {
    it('does not try to add stylesheets for SSR', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader
          featureAppId="testId"
          src="example.js"
          serverSrc="example-node.js"
        />
      );

      expect(mockAddStylesheetsForSsr).not.toHaveBeenCalled();
    });
  });

  describe('with a css prop', () => {
    it('adds the stylesheets for SSR', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader
          featureAppId="testId"
          src="example.js"
          serverSrc="example-node.js"
          css={[{href: 'foo.css'}]}
        />
      );

      expect(mockAddStylesheetsForSsr.mock.calls).toEqual([
        [[{href: 'foo.css'}]],
      ]);
    });

    describe('and a baseUrl', () => {
      it('adds the stylesheets for SSR', () => {
        renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            baseUrl="http://feature-hub.io"
            src="example.js"
            serverSrc="example-node.js"
            css={[
              {href: 'http://example.com/foo.css'},
              {href: 'bar.css', media: 'print'},
            ]}
          />
        );

        expect(mockAddStylesheetsForSsr.mock.calls).toEqual([
          [
            [
              {href: 'http://example.com/foo.css'},
              {href: 'http://feature-hub.io/bar.css', media: 'print'},
            ],
          ],
        ]);
      });
    });
  });
});
