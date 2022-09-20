// tslint:disable:no-implicit-dependencies

import {AsyncSsrManagerV1} from '@feature-hub/async-ssr-manager';
import {
  AsyncValue,
  FeatureAppDefinition,
  FeatureAppManager,
} from '@feature-hub/core';
import * as React from 'react';
import TestRenderer from 'react-test-renderer';
import {CustomFeatureAppRenderingParams, FeatureAppLoader} from '..';
import {FeatureHubContextProvider} from '../feature-hub-context';
import {InternalFeatureAppContainer} from '../internal/internal-feature-app-container';
import {logger} from './logger';
import {TestErrorBoundary} from './test-error-boundary';

interface MockAsyncSsrManager extends AsyncSsrManagerV1 {
  scheduleRerender: ((promise: Promise<unknown>) => void) & jest.Mock;
}

jest.mock('../internal/internal-feature-app-container', () => ({
  InternalFeatureAppContainer: jest.fn(
    () => 'mocked InternalFeatureAppContainer'
  ),
}));

describe('FeatureAppLoader', () => {
  let mockFeatureAppManager: FeatureAppManager;
  let mockGetAsyncFeatureAppDefinition: jest.Mock;
  let mockAsyncFeatureAppDefinition: AsyncValue<FeatureAppDefinition<unknown>>;
  let mockAsyncSsrManager: MockAsyncSsrManager;
  let mockAddUrlForHydration: jest.Mock;
  let mockAddStylesheetsForSsr: jest.Mock;
  let consoleErrorSpy: jest.SpyInstance;

  const usingTestErrorBoundaryConsoleErrorCalls = [
    [
      expect.stringContaining(
        'React will try to recreate this component tree from scratch using the error boundary you provided, TestErrorBoundary.'
      ),
    ],
  ];

  const noErrorBoundaryConsoleErrorCalls = [
    [
      expect.stringContaining(
        'Consider adding an error boundary to your tree to customize error handling behavior.'
      ),
    ],
  ];

  const expectConsoleErrorCalls = (expectedConsoleErrorCalls: unknown[][]) => {
    try {
      expect(consoleErrorSpy.mock.calls).toEqual(expectedConsoleErrorCalls);
    } finally {
      consoleErrorSpy.mockClear();
    }
  };

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error');

    if (document.head) {
      document.head.innerHTML = '';
    }

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
  });

  afterEach(() => {
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('throws an error when rendered without a FeatureHubContextProvider', () => {
    expect(() =>
      TestRenderer.create(
        <FeatureAppLoader featureAppId="testId" src="example.js" />
      )
    ).toThrowError(
      new Error(
        'No Feature Hub context was provided! There are two possible causes: 1.) No FeatureHubContextProvider was rendered in the React tree. 2.) A Feature App that renders itself a FeatureAppLoader or a FeatureAppContainer did not declare @feature-hub/react as an external package.'
      )
    );

    expectConsoleErrorCalls(noErrorBoundaryConsoleErrorCalls);
  });

  const renderWithFeatureHubContext = (
    node: React.ReactNode,
    options: {customLogger?: boolean; handleError?: (error: Error) => void} = {}
  ) => {
    const {customLogger = true, handleError = jest.fn()} = options;

    return TestRenderer.create(
      <FeatureHubContextProvider
        value={{
          featureAppManager: mockFeatureAppManager,
          asyncSsrManager: mockAsyncSsrManager,
          addUrlForHydration: mockAddUrlForHydration,
          addStylesheetsForSsr: mockAddStylesheetsForSsr,
          logger: customLogger ? logger : undefined,
        }}
      >
        <TestErrorBoundary handleError={handleError}>{node}</TestErrorBoundary>
      </FeatureHubContextProvider>
    );
  };

  it('throws an error if no src is provided', () => {
    const handleError = jest.fn();

    const testRenderer = renderWithFeatureHubContext(
      <FeatureAppLoader featureAppId="testId" src="" />,
      {handleError}
    );

    expect(handleError.mock.calls).toEqual([[new Error('No src provided.')]]);
    expect(testRenderer.toJSON()).toBe('test error boundary');
    expectConsoleErrorCalls(usingTestErrorBoundaryConsoleErrorCalls);
  });

  describe('when rendering initially', () => {
    describe('when given no children function', () => {
      it('renders nothing', () => {
        const testRenderer = renderWithFeatureHubContext(
          <FeatureAppLoader featureAppId="testId" src="example.js" />
        );

        expect(testRenderer.toJSON()).toBeNull();
      });
    });
  });

  describe('without a css prop', () => {
    it('does not change the document head', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader featureAppId="testId" src="example.js" />
      );

      expect(document.head).toMatchSnapshot();
    });

    it('does not try to add stylesheets for SSR', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader featureAppId="testId" src="example.js" />
      );

      expect(mockAddStylesheetsForSsr).not.toHaveBeenCalled();
    });
  });

  describe('with a css prop', () => {
    it('appends link elements to the document head', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader
          featureAppId="testId"
          src="example.js"
          css={[
            {href: 'https://example.com/foo.css'},
            {href: 'bar.css', media: 'print'},
          ]}
        />
      );

      expect(document.head).toMatchSnapshot();
    });

    it('does not add the stylesheets for SSR', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader
          featureAppId="testId"
          src="example.js"
          css={[{href: 'foo.css'}]}
        />
      );

      expect(mockAddStylesheetsForSsr).not.toHaveBeenCalled();
    });

    describe('when the css has already been appended', () => {
      it('does not append the css a second time', () => {
        renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            src="example.js"
            css={[{href: 'foo.css'}]}
          />
        );

        renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            src="example.js"
            css={[{href: 'foo.css'}]}
          />
        );

        expect(document.head).toMatchSnapshot();
      });
    });

    describe('and a baseUrl', () => {
      it('appends link elements to the document head', () => {
        renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            baseUrl="http://feature-hub.io"
            src="example.js"
            css={[
              {href: 'https://example.com/foo.css'},
              {href: 'bar.css', media: 'print'},
            ]}
          />
        );

        expect(document.head).toMatchSnapshot();
      });
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

    it('calls getAsyncFeatureAppDefinition with the given src exactly once', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader featureAppId="testId" src="example.js" />
      );

      expect(mockGetAsyncFeatureAppDefinition.mock.calls).toEqual([
        ['example.js', undefined],
      ]);
    });

    describe('with a baseUrl and a relative src', () => {
      it('calls getAsyncFeatureAppDefinition with a prepended src', () => {
        renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            baseUrl="/base"
            src="example.js"
          />
        );

        expect(mockGetAsyncFeatureAppDefinition.mock.calls).toEqual([
          ['/base/example.js', undefined],
        ]);
      });
    });

    describe('with a baseUrl and an absolute src', () => {
      it('calls getAsyncFeatureAppDefinition with the absolute src', () => {
        renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            baseUrl="/base"
            src="http://example.com/foo.js"
          />
        );

        expect(mockGetAsyncFeatureAppDefinition.mock.calls).toEqual([
          ['http://example.com/foo.js', undefined],
        ]);
      });
    });

    describe('with a moduleType', () => {
      it('calls getAsyncFeatureAppDefinition with the given src and moduleType', () => {
        renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            src="example.js"
            moduleType="a"
            serverModuleType="b"
          />
        );

        expect(mockGetAsyncFeatureAppDefinition.mock.calls).toEqual([
          ['example.js', 'a'],
        ]);
      });
    });

    it('renders an InternalFeatureAppContainer', () => {
      const onError = jest.fn();
      const beforeCreate = jest.fn();
      const done = jest.fn();
      const children = jest.fn();

      const testRenderer = renderWithFeatureHubContext(
        <FeatureAppLoader
          src="example.js"
          featureAppId="testId"
          config="testConfig"
          beforeCreate={beforeCreate}
          done={done}
          onError={onError}
          baseUrl="/base"
          children={children}
        />
      );

      expect(testRenderer.toJSON()).toBe('mocked InternalFeatureAppContainer');

      const expectedProps = {
        baseUrl: '/base',
        beforeCreate,
        done,
        config: 'testConfig',
        featureAppDefinition: mockFeatureAppDefinition,
        featureAppId: 'testId',
        onError,
        children,
        featureAppManager: mockFeatureAppManager,
        logger,
      };

      expect(InternalFeatureAppContainer).toHaveBeenCalledWith(
        expectedProps,
        {}
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

    it('does not add a URL for hydration', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader
          featureAppId="testId"
          src="example.js"
          serverSrc="example-node.js"
        />
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

    it('renders nothing and logs an error (only once)', async () => {
      const testRenderer = renderWithFeatureHubContext(
        <FeatureAppLoader src="example.js" featureAppId="testId" />
      );

      try {
        await mockAsyncFeatureAppDefinition.promise;
      } catch (error) {
        expect(error).toBe(mockError);
      } finally {
        expect(testRenderer.toJSON()).toBeNull();

        expect(logger.error.mock.calls).toEqual([
          [
            'The Feature App for the src "example.js" and the ID "testId" could not be rendered.',
            mockError,
          ],
        ]);
      }
    });

    describe('with onError provided', () => {
      it('calls onError with the error', () => {
        const onError = jest.fn();

        renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            src="example.js"
            onError={onError}
          />
        );

        expect(onError.mock.calls).toEqual([[mockError]]);
      });

      it('does not log the error', () => {
        renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            src="example.js"
            onError={jest.fn()}
          />
        );

        expect(logger.error).not.toHaveBeenCalled();
      });

      describe('when onError throws an error', () => {
        let onErrorMockError: Error;

        beforeEach(() => {
          onErrorMockError = new Error('Throwing in onError.');
        });

        it('throws the error in render', () => {
          const handleError = jest.fn();

          const testRenderer = renderWithFeatureHubContext(
            <FeatureAppLoader
              featureAppId="testId"
              src="example.js"
              onError={() => {
                throw onErrorMockError;
              }}
            />,
            {handleError}
          );

          expect(handleError.mock.calls).toEqual([[onErrorMockError]]);
          expect(testRenderer.toJSON()).toBe('test error boundary');
          expectConsoleErrorCalls(usingTestErrorBoundaryConsoleErrorCalls);
        });
      });
    });

    describe('with children function provided', () => {
      it('calls children with error and loading=false', () => {
        const children = jest.fn().mockReturnValue(null);

        renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            src="example.js"
            children={children}
          />
        );

        const expectedParameter: CustomFeatureAppRenderingParams = {
          featureAppNode: undefined,
          error: mockError,
          loading: false,
        };

        expect(children.mock.calls).toEqual([[expectedParameter]]);
      });

      it('renders what children returns', () => {
        const children = jest.fn(() => 'Custom Error UI');

        const testRenderer = renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            src="example.js"
            children={children}
          />
        );

        expect(testRenderer.toJSON()).toBe('Custom Error UI');
      });

      describe('when children function throws an error', () => {
        let childrenMockError: Error;

        beforeEach(() => {
          childrenMockError = new Error('Throwing in children.');
        });

        it('throws the error in render', () => {
          const handleError = jest.fn();

          const testRenderer = renderWithFeatureHubContext(
            <FeatureAppLoader
              featureAppId="testId"
              src="example.js"
              children={() => {
                throw childrenMockError;
              }}
            />,
            {handleError}
          );

          expect(handleError.mock.calls).toEqual([[childrenMockError]]);
          expect(testRenderer.toJSON()).toBe('test error boundary');
          expectConsoleErrorCalls(usingTestErrorBoundaryConsoleErrorCalls);
        });
      });

      describe('when onError is also provided', () => {
        it('calls onError with the error', () => {
          const onError = jest.fn();

          renderWithFeatureHubContext(
            <FeatureAppLoader
              featureAppId="testId"
              src="example.js"
              onError={onError}
              children={jest.fn().mockReturnValue(null)}
            />
          );

          expect(onError.mock.calls).toEqual([[mockError]]);
        });

        describe('and throws an error', () => {
          let onErrorMockError: Error;

          beforeEach(() => {
            onErrorMockError = new Error('Throwing in onError.');
          });

          it('does not call children and throws the error in render', () => {
            const handleError = jest.fn();
            const children = jest.fn();

            const testRenderer = renderWithFeatureHubContext(
              <FeatureAppLoader
                featureAppId="testId"
                src="example.js"
                onError={() => {
                  throw onErrorMockError;
                }}
                children={children}
              />,
              {handleError}
            );

            expect(children).not.toHaveBeenCalled();
            expect(handleError.mock.calls).toEqual([[onErrorMockError]]);
            expect(testRenderer.toJSON()).toBe('test error boundary');
            expectConsoleErrorCalls(usingTestErrorBoundaryConsoleErrorCalls);
          });
        });
      });
    });
  });

  describe('when a Feature App definition is loaded asynchronously', () => {
    let mockFeatureAppDefinition: FeatureAppDefinition<unknown>;

    beforeEach(() => {
      mockFeatureAppDefinition = {create: jest.fn()};

      mockAsyncFeatureAppDefinition = new AsyncValue(
        new Promise<FeatureAppDefinition<unknown>>((resolve) =>
          // defer to next event loop turn to guarantee asynchronism
          setImmediate(() => resolve(mockFeatureAppDefinition))
        )
      );
    });

    it('calls getAsyncFeatureAppDefinition with the given src exactly twice', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader featureAppId="testId" src="example.js" />
      );

      expect(mockGetAsyncFeatureAppDefinition.mock.calls).toEqual([
        ['example.js', undefined],
        ['example.js', undefined],
      ]);
    });

    describe('with a baseUrl and a relative src', () => {
      it('calls getAsyncFeatureAppDefinition with a prepended src', () => {
        renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            baseUrl="/base"
            src="example.js"
          />
        );

        expect(mockGetAsyncFeatureAppDefinition.mock.calls).toEqual([
          ['/base/example.js', undefined],
          ['/base/example.js', undefined],
        ]);
      });
    });

    describe('with a baseUrl and an absolute src', () => {
      it('calls getAsyncFeatureAppDefinition with the absolute src', () => {
        renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            baseUrl="/base"
            src="http://example.com/foo.js"
          />
        );

        expect(mockGetAsyncFeatureAppDefinition.mock.calls).toEqual([
          ['http://example.com/foo.js', undefined],
          ['http://example.com/foo.js', undefined],
        ]);
      });
    });

    describe('with a moduleType prop', () => {
      it('calls getAsyncFeatureAppDefinition with the given src and moduleType', () => {
        renderWithFeatureHubContext(
          <FeatureAppLoader
            featureAppId="testId"
            src="example.js"
            moduleType="a"
            serverModuleType="b"
          />
        );

        expect(mockGetAsyncFeatureAppDefinition.mock.calls).toEqual([
          ['example.js', 'a'],
          ['example.js', 'a'],
        ]);
      });
    });

    it('initially renders nothing', () => {
      const testRenderer = renderWithFeatureHubContext(
        <FeatureAppLoader featureAppId="testId" src="example.js" />
      );

      expect(testRenderer.toJSON()).toBeNull();
    });

    it('renders a FeatureAppContainer when loaded', async () => {
      const testRenderer = renderWithFeatureHubContext(
        <FeatureAppLoader src="example.js" featureAppId="testId" />
      );

      await mockAsyncFeatureAppDefinition.promise;

      expect(testRenderer.toJSON()).toBe('mocked InternalFeatureAppContainer');
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

    it('does not add a URL for hydration', () => {
      renderWithFeatureHubContext(
        <FeatureAppLoader
          featureAppId="testId"
          src="example.js"
          serverSrc="example-node.js"
        />
      );

      expect(mockAddUrlForHydration).not.toHaveBeenCalled();
    });

    describe('when unmounted before loading has finished', () => {
      it('renders nothing', async () => {
        const testRenderer = renderWithFeatureHubContext(
          <FeatureAppLoader featureAppId="testId" src="example.js" />
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
        <FeatureAppLoader src="example.js" featureAppId="testId" />
      );

      expect.assertions(4); // Note: one of the assertions is in afterEach.

      try {
        await mockAsyncFeatureAppDefinition.promise;
      } catch (error) {
        expect(error).toBe(mockError);
      }

      expect(testRenderer.toJSON()).toBeNull();

      expect(logger.error.mock.calls).toEqual([
        [
          'The Feature App for the src "example.js" and the ID "testId" could not be rendered.',
          mockError,
        ],
      ]);
    });

    describe('with onError provided', () => {
      it('calls onError with the error', async () => {
        const onError = jest.fn();

        try {
          renderWithFeatureHubContext(
            <FeatureAppLoader
              featureAppId="testId"
              src="example.js"
              onError={onError}
            />
          );

          await mockAsyncFeatureAppDefinition.promise;
        } catch {}

        expect(onError.mock.calls).toEqual([[mockError]]);
      });

      it('does not log the error', async () => {
        try {
          renderWithFeatureHubContext(
            <FeatureAppLoader
              featureAppId="testId"
              src="example.js"
              onError={jest.fn()}
            />
          );

          await mockAsyncFeatureAppDefinition.promise;
        } catch {}

        expect(logger.error).not.toHaveBeenCalled();
      });

      describe('when onError throws an error', () => {
        let onErrorMockError: Error;

        beforeEach(() => {
          onErrorMockError = new Error('Throwing in onError.');
        });

        it('throws the error in render', async () => {
          const handleError = jest.fn();

          const testRenderer = renderWithFeatureHubContext(
            <FeatureAppLoader
              featureAppId="testId"
              src="example.js"
              onError={() => {
                throw onErrorMockError;
              }}
            />,
            {handleError}
          );

          try {
            await mockAsyncFeatureAppDefinition.promise;
          } catch {}

          expect(handleError.mock.calls).toEqual([[onErrorMockError]]);
          expect(testRenderer.toJSON()).toBe('test error boundary');
          expectConsoleErrorCalls(usingTestErrorBoundaryConsoleErrorCalls);
        });

        describe('when unmounted before loading has finished', () => {
          it('calls onError with the error', async () => {
            const onError = jest.fn(() => {
              throw onErrorMockError;
            });

            const testRenderer = renderWithFeatureHubContext(
              <FeatureAppLoader
                featureAppId="testId"
                src="example.js"
                onError={onError}
              />
            );

            testRenderer.unmount();

            try {
              await mockAsyncFeatureAppDefinition.promise;
            } catch {}

            expect(onError.mock.calls).toEqual([[mockError]]);
          });

          it('renders nothing', async () => {
            const testRenderer = renderWithFeatureHubContext(
              <FeatureAppLoader
                featureAppId="testId"
                src="example.js"
                onError={() => {
                  throw onErrorMockError;
                }}
              />
            );

            testRenderer.unmount();

            try {
              await mockAsyncFeatureAppDefinition.promise;
            } catch {}

            expect(testRenderer.toJSON()).toBeNull();
          });
        });
      });
    });

    describe('when unmounted before loading has finished', () => {
      it('logs an error', async () => {
        const testRenderer = renderWithFeatureHubContext(
          <FeatureAppLoader featureAppId="testId" src="example.js" />
        );

        testRenderer.unmount();

        expect.assertions(3); // Note: one of the assertions is in afterEach.

        try {
          await mockAsyncFeatureAppDefinition.promise;
        } catch (error) {
          expect(error).toBe(mockError);
        }

        expect(logger.error.mock.calls).toEqual([
          [
            'The Feature App for the src "example.js" and the ID "testId" could not be rendered.',
            mockError,
          ],
        ]);
      });
    });
  });

  describe('without a custom logger', () => {
    it('logs messages using the console', () => {
      const mockError = new Error('Failed to load Feature App module.');

      mockAsyncFeatureAppDefinition = new AsyncValue(
        Promise.reject(mockError),
        undefined,
        mockError
      );

      renderWithFeatureHubContext(
        <FeatureAppLoader src="example.js" featureAppId="testId" />,
        {customLogger: false}
      );

      expectConsoleErrorCalls([
        [
          'The Feature App for the src "example.js" and the ID "testId" could not be rendered.',
          mockError,
        ],
      ]);
    });
  });
});
