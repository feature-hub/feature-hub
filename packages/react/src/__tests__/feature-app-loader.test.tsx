// tslint:disable:no-implicit-dependencies

import {AsyncSsrManagerV0} from '@feature-hub/async-ssr-manager';
import {
  AsyncValue,
  FeatureAppDefinition,
  FeatureAppManagerLike
} from '@feature-hub/core';
import stubMethods, {Stubbed} from 'jest-stub-methods';
import * as React from 'react';
import TestRenderer from 'react-test-renderer';
import {FeatureAppContainer, FeatureAppLoader} from '..';
import {FeatureHubContextProvider} from '../feature-hub-context';

interface MockAsyncSsrManager extends AsyncSsrManagerV0 {
  scheduleRerender: ((promise: Promise<unknown>) => void) & jest.Mock;
}

jest.mock('../feature-app-container', () => ({
  FeatureAppContainer: jest.fn(() => 'mocked FeatureAppContainer')
}));

describe('FeatureAppLoader', () => {
  let mockFeatureAppManager: FeatureAppManagerLike;
  let mockGetAsyncFeatureAppDefinition: jest.Mock;
  let mockAsyncFeatureAppDefinition: AsyncValue<FeatureAppDefinition<unknown>>;
  let mockAsyncSsrManager: MockAsyncSsrManager;
  let mockAddUrlForHydration: jest.Mock;
  let stubbedConsole: Stubbed<Console>;

  beforeEach(() => {
    if (document.head) {
      document.head.innerHTML = '';
    }

    mockAsyncFeatureAppDefinition = new AsyncValue(
      new Promise<FeatureAppDefinition<unknown>>(jest.fn())
    );

    mockGetAsyncFeatureAppDefinition = jest.fn(
      () => mockAsyncFeatureAppDefinition
    );

    mockFeatureAppManager = {
      getAsyncFeatureAppDefinition: mockGetAsyncFeatureAppDefinition,
      getFeatureAppScope: jest.fn(),
      preloadFeatureApp: jest.fn()
    };

    mockAsyncSsrManager = {
      scheduleRerender: jest.fn(),
      renderUntilCompleted: jest.fn()
    };

    mockAddUrlForHydration = jest.fn();

    stubbedConsole = stubMethods(console);
  });

  afterEach(() => {
    stubbedConsole.restore();
  });

  it('throws an error when rendered without a FeatureHubContextProvider', () => {
    expect(() =>
      TestRenderer.create(<FeatureAppLoader src="example.js" />)
    ).toThrowError(
      new Error(
        'No Feature Hub context was provided! There are two possible causes: 1.) No FeatureHubContextProvider was rendered in the React tree. 2.) A Feature App that renders itself a FeatureAppLoader or a FeatureAppContainer did not declare @feature-hub/react as an external package.'
      )
    );
  });

  const renderWithFeatureHubContext = (node: React.ReactNode) =>
    TestRenderer.create(
      <FeatureHubContextProvider
        value={{
          featureAppManager: mockFeatureAppManager,
          asyncSsrManager: mockAsyncSsrManager,
          addUrlForHydration: mockAddUrlForHydration
        }}
      >
        {node}
      </FeatureHubContextProvider>
    );

  it('throws an error if no src is provided', () => {
    expect(() =>
      renderWithFeatureHubContext(<FeatureAppLoader src="" />)
    ).toThrowError(new Error('No src provided.'));
  });

  it('initially renders nothing', () => {
    const testRenderer = renderWithFeatureHubContext(
      <FeatureAppLoader src="example.js" />
    );

    expect(testRenderer.toJSON()).toBeNull();
  });

  describe('without a css prop', () => {
    it('does not change the document head', () => {
      renderWithFeatureHubContext(<FeatureAppLoader src="example.js" />);

      expect(document.head).toMatchSnapshot();
    });
  });

  describe('with a css prop', () => {
    it('appends link elements to the document head', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader
          src="example.js"
          css={[{href: 'foo.css'}, {href: 'bar.css', media: 'print'}]}
        />
      );

      expect(document.head).toMatchSnapshot();
    });

    describe('when the css has already been appended', () => {
      it('does not append the css a second time', () => {
        renderWithFeatureHubContext(
          <FeatureAppLoader src="example.js" css={[{href: 'foo.css'}]} />
        );

        renderWithFeatureHubContext(
          <FeatureAppLoader src="example.js" css={[{href: 'foo.css'}]} />
        );

        expect(document.head).toMatchSnapshot();
      });
    });
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

    it('renders a FeatureAppContainer', () => {
      const testRenderer = renderWithFeatureHubContext(
        <FeatureAppLoader
          src="example.js"
          idSpecifier="testIdSpecifier"
          instanceConfig="testInstanceConfig"
        />
      );

      expect(testRenderer.toJSON()).toBe('mocked FeatureAppContainer');

      const expectedProps = {
        featureAppDefinition: mockFeatureAppDefinition,
        idSpecifier: 'testIdSpecifier',
        instanceConfig: 'testInstanceConfig'
      };

      expect(FeatureAppContainer).toHaveBeenCalledWith(expectedProps, {});
    });

    it('does not schedule a rerender on the Async SSR Manager', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader src="example.js" serverSrc="example-node.js" />
      );

      expect(mockAsyncSsrManager.scheduleRerender).not.toHaveBeenCalled();
    });

    it('does not add a URL for hydration', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader src="example.js" serverSrc="example-node.js" />
      );

      expect(mockAddUrlForHydration).not.toHaveBeenCalled();
    });
  });

  describe('when the async Feature App definition synchronously has an error', () => {
    let mockError: Error;

    beforeEach(() => {
      mockError = new Error('Failed to load Feature App module.');

      mockAsyncFeatureAppDefinition = new AsyncValue(
        Promise.reject(mockError),
        undefined,
        mockError
      );
    });

    it('renders nothing and logs an error', () => {
      const testRenderer = renderWithFeatureHubContext(
        <FeatureAppLoader src="example.js" idSpecifier="testIdSpecifier" />
      );

      expect(testRenderer.toJSON()).toBeNull();

      expect(stubbedConsole.stub.error.mock.calls).toEqual([
        [
          'The Feature App for the src "example.js" and the ID specifier "testIdSpecifier" could not be rendered.',
          mockError
        ]
      ]);
    });
  });

  describe('when a Feature App definition is loaded asynchronously', () => {
    let mockFeatureAppDefinition: FeatureAppDefinition<unknown>;

    beforeEach(() => {
      mockFeatureAppDefinition = {
        id: 'testId',
        create: jest.fn()
      };

      mockAsyncFeatureAppDefinition = new AsyncValue(
        new Promise<FeatureAppDefinition<unknown>>(resolve =>
          // defer to next event loop turn to guarantee asynchronism
          setImmediate(() => resolve(mockFeatureAppDefinition))
        )
      );
    });

    it('initially renders nothing', () => {
      const testRenderer = renderWithFeatureHubContext(
        <FeatureAppLoader src="example.js" />
      );

      expect(testRenderer.toJSON()).toBeNull();
    });

    it('renders a FeatureAppContainer when loaded', async () => {
      const testRenderer = renderWithFeatureHubContext(
        <FeatureAppLoader src="example.js" idSpecifier="testIdSpecifier" />
      );

      await mockAsyncFeatureAppDefinition.promise;

      expect(testRenderer.toJSON()).toBe('mocked FeatureAppContainer');
    });

    it('does not schedule a rerender on the Async SSR Manager', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader src="example.js" serverSrc="example-node.js" />
      );

      expect(mockAsyncSsrManager.scheduleRerender).not.toHaveBeenCalled();
    });

    it('does not add a URL for hydration', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader src="example.js" serverSrc="example-node.js" />
      );

      expect(mockAddUrlForHydration).not.toHaveBeenCalled();
    });

    describe('when unmounted before loading has finished', () => {
      it('renders nothing', async () => {
        const testRenderer = renderWithFeatureHubContext(
          <FeatureAppLoader src="example.js" />
        );

        testRenderer.unmount();

        await mockAsyncFeatureAppDefinition.promise;

        expect(testRenderer.toJSON()).toBeNull();
      });
    });
  });

  describe('when a Feature App definition fails to load asynchronously', () => {
    let mockError: Error;

    beforeEach(() => {
      mockError = new Error('Failed to load Feature App module.');

      mockAsyncFeatureAppDefinition = new AsyncValue(
        new Promise<FeatureAppDefinition<unknown>>((_, reject) =>
          // defer to next event loop turn to guarantee asynchronism
          setImmediate(() => reject(mockError))
        )
      );
    });

    it('renders nothing and logs an error', async () => {
      const testRenderer = renderWithFeatureHubContext(
        <FeatureAppLoader src="example.js" idSpecifier="testIdSpecifier" />
      );

      expect.assertions(3);

      try {
        await mockAsyncFeatureAppDefinition.promise;
      } catch (error) {
        expect(error).toBe(mockError);
      }

      expect(testRenderer.toJSON()).toBeNull();

      expect(stubbedConsole.stub.error.mock.calls).toEqual([
        [
          'The Feature App for the src "example.js" and the ID specifier "testIdSpecifier" could not be rendered.',
          mockError
        ]
      ]);
    });

    describe('when unmounted before loading has finished', () => {
      it('logs an error', async () => {
        const testRenderer = renderWithFeatureHubContext(
          <FeatureAppLoader src="example.js" />
        );

        testRenderer.unmount();

        expect.assertions(2);

        try {
          await mockAsyncFeatureAppDefinition.promise;
        } catch (error) {
          expect(error).toBe(mockError);
        }

        expect(stubbedConsole.stub.error.mock.calls).toEqual([
          [
            'The Feature App for the src "example.js" could not be rendered.',
            mockError
          ]
        ]);
      });
    });
  });
});
