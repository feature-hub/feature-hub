/**
 * @jest-environment node
 */

// tslint:disable:no-implicit-dependencies

import {AsyncSsrManagerV1} from '@feature-hub/async-ssr-manager';
import {
  AsyncValue,
  FeatureAppDefinition,
  FeatureAppManager
} from '@feature-hub/core';
import {Stubbed, stubMethods} from 'jest-stub-methods';
import * as React from 'react';
import * as ReactDOM from 'react-dom/server';
import {Css, FeatureAppLoader, FeatureHubContextProvider} from '..';

interface MockAsyncSsrManager extends AsyncSsrManagerV1 {
  scheduleRerender: ((promise: Promise<unknown>) => void) & jest.Mock;
}

jest.mock('../feature-app-container', () => ({
  FeatureAppContainer: jest.fn(() => 'mocked FeatureAppContainer')
}));

describe('FeatureAppLoader (on Node.js)', () => {
  let mockFeatureAppManager: FeatureAppManager;
  let mockGetAsyncFeatureAppDefinition: jest.Mock;
  let mockAsyncFeatureAppDefinition: AsyncValue<FeatureAppDefinition<unknown>>;
  let mockAsyncSsrManager: MockAsyncSsrManager;
  let mockAddUrlForHydration: jest.Mock;
  let mockAddStylesheetsForSsr: jest.Mock;
  let stubbedConsole: Stubbed<Console>;

  beforeEach(() => {
    mockAsyncFeatureAppDefinition = new AsyncValue(
      new Promise<FeatureAppDefinition<unknown>>(jest.fn())
    );

    mockGetAsyncFeatureAppDefinition = jest.fn(
      () => mockAsyncFeatureAppDefinition
    );

    mockFeatureAppManager = ({
      getAsyncFeatureAppDefinition: mockGetAsyncFeatureAppDefinition,
      getFeatureAppScope: jest.fn(),
      preloadFeatureApp: jest.fn()
    } as Partial<FeatureAppManager>) as FeatureAppManager;

    mockAsyncSsrManager = {
      scheduleRerender: jest.fn(),
      renderUntilCompleted: jest.fn()
    };

    mockAddUrlForHydration = jest.fn();
    mockAddStylesheetsForSsr = jest.fn();

    stubbedConsole = stubMethods(console);
  });

  afterEach(() => {
    stubbedConsole.restore();
  });

  const renderWithFeatureHubContext = (node: React.ReactNode) =>
    ReactDOM.renderToString(
      <FeatureHubContextProvider
        value={{
          featureAppManager: mockFeatureAppManager,
          asyncSsrManager: mockAsyncSsrManager,
          addUrlForHydration: mockAddUrlForHydration,
          addStylesheetsForSsr: mockAddStylesheetsForSsr
        }}
      >
        {node}
      </FeatureHubContextProvider>
    );

  describe('without a serverSrc', () => {
    it('does not try to load a Feature App definition', () => {
      renderWithFeatureHubContext(<FeatureAppLoader src="example.js" />);

      expect(mockGetAsyncFeatureAppDefinition).not.toHaveBeenCalled();
    });

    it('does not schedule a rerender on the Async SSR Manager', () => {
      renderWithFeatureHubContext(<FeatureAppLoader src="example.js" />);

      expect(mockAsyncSsrManager.scheduleRerender).not.toHaveBeenCalled();
    });

    it('does not add a URL for hydration', () => {
      renderWithFeatureHubContext(<FeatureAppLoader src="example.js" />);

      expect(mockAddUrlForHydration).not.toHaveBeenCalled();
    });
  });

  describe('with a serverSrc', () => {
    it('loads a Feature App definition for the serverSrc', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader src="example.js" serverSrc="example-node.js" />
      );

      expect(mockGetAsyncFeatureAppDefinition.mock.calls).toEqual([
        ['example-node.js']
      ]);
    });

    it('schedules a rerender on the Async SSR Manager with the feature app definition promise', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader src="example.js" serverSrc="example-node.js" />
      );

      expect(mockAsyncSsrManager.scheduleRerender.mock.calls).toEqual([
        [mockAsyncFeatureAppDefinition.promise]
      ]);
    });

    it('adds the src URL for hydration', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader src="example.js" serverSrc="example-node.js" />
      );

      expect(mockAddUrlForHydration).toHaveBeenCalledWith('example.js');
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

      it('does not schedule a rerender on the Async SSR Manager', () => {
        renderWithFeatureHubContext(
          <FeatureAppLoader src="example.js" serverSrc="example-node.js" />
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

      it('logs and re-throws the error', () => {
        expect(() =>
          renderWithFeatureHubContext(
            <FeatureAppLoader
              src="example.js"
              serverSrc="example-node.js"
              idSpecifier="testIdSpecifier"
            />
          )
        ).toThrowError(mockError);

        expect(stubbedConsole.stub.error.mock.calls).toEqual([
          [
            'The Feature App for the src "example-node.js" and the ID specifier "testIdSpecifier" could not be rendered.',
            mockError
          ]
        ]);
      });

      it('does not schedule a rerender on the Async SSR Manager', () => {
        try {
          renderWithFeatureHubContext(
            <FeatureAppLoader src="example.js" serverSrc="example-node.js" />
          );
        } catch {}

        expect(mockAsyncSsrManager.scheduleRerender).not.toHaveBeenCalled();
      });

      it('adds the src URL for hydration', () => {
        try {
          renderWithFeatureHubContext(
            <FeatureAppLoader src="example.js" serverSrc="example-node.js" />
          );
        } catch {}

        expect(mockAddUrlForHydration).toHaveBeenCalledWith('example.js');
      });
    });
  });

  describe('without a css prop', () => {
    it('does not try to add stylesheets for SSR', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader src="example.js" serverSrc="example-node.js" />
      );

      expect(mockAddStylesheetsForSsr).not.toHaveBeenCalled();
    });
  });

  describe('with a css prop', () => {
    it('adds the stylesheets for SSR', () => {
      const css: Css[] = [{href: 'foo.css'}];

      renderWithFeatureHubContext(
        <FeatureAppLoader
          src="example.js"
          serverSrc="example-node.js"
          css={css}
        />
      );

      expect(mockAddStylesheetsForSsr.mock.calls).toEqual([[css]]);
    });
  });
});
