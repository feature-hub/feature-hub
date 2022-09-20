// tslint:disable:no-implicit-dependencies
import {
  FeatureAppDefinition,
  FeatureAppManager,
  FeatureAppScope,
  FeatureAppScopeOptions,
} from '@feature-hub/core';
import * as React from 'react';
import TestRenderer from 'react-test-renderer';
import {
  CustomFeatureAppRenderingParams,
  FeatureApp,
  FeatureAppContainer,
  FeatureHubContextProvider,
} from '..';
import {InternalFeatureAppContainer} from '../internal/internal-feature-app-container';
import {logger} from './logger';
import {TestErrorBoundary} from './test-error-boundary';

describe('FeatureAppContainer', () => {
  let mockFeatureAppManager: FeatureAppManager;
  let mockCreateFeatureAppScope: jest.Mock;
  let mockFeatureAppDefinition: FeatureAppDefinition<FeatureApp>;
  let mockFeatureAppScope: FeatureAppScope<unknown>;
  let consoleErrorSpy: jest.SpyInstance;

  const usingErrorBoundaryConsoleErrorCalls = [
    [expect.any(String), expect.any(Error)],
    [
      expect.stringContaining(
        'React will try to recreate this component tree from scratch using the error boundary you provided'
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

  const usingTestErrorBoundaryConsoleErrorCalls = [
    [
      expect.stringContaining(
        'React will try to recreate this component tree from scratch using the error boundary you provided, TestErrorBoundary.'
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
    mockFeatureAppDefinition = {create: jest.fn()};
    mockFeatureAppScope = {featureApp: {}, release: jest.fn()};
    mockCreateFeatureAppScope = jest.fn(() => ({...mockFeatureAppScope}));

    mockFeatureAppManager = ({
      getAsyncFeatureAppDefinition: jest.fn(),
      createFeatureAppScope: mockCreateFeatureAppScope,
      preloadFeatureApp: jest.fn(),
    } as Partial<FeatureAppManager>) as FeatureAppManager;
  });

  afterEach(() => {
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    consoleErrorSpy.mockRestore();
  });

  it('throws an error when rendered without a FeatureHubContextProvider', () => {
    expect(() =>
      TestRenderer.create(
        <FeatureAppContainer
          featureAppId="testId"
          featureAppDefinition={mockFeatureAppDefinition}
        />
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
    {
      customLogger = true,
      testRendererOptions,
    }: {
      customLogger?: boolean;
      testRendererOptions?: TestRenderer.TestRendererOptions;
    } = {}
  ) =>
    TestRenderer.create(
      <FeatureHubContextProvider
        value={{
          featureAppManager: mockFeatureAppManager,
          logger: customLogger ? logger : undefined,
        }}
      >
        {node}
      </FeatureHubContextProvider>,
      testRendererOptions
    );

  it('calls the Feature App manager with the given featureAppDefinition, featureAppId, config, baseUrl, beforeCreate callback, and done callback', () => {
    const mockBeforeCreate = jest.fn();
    const mockDone = jest.fn();

    renderWithFeatureHubContext(
      <FeatureAppContainer
        featureAppDefinition={mockFeatureAppDefinition}
        featureAppId="testId"
        config="testConfig"
        baseUrl="/base"
        beforeCreate={mockBeforeCreate}
        done={mockDone}
      />
    );

    const expectedOptions: FeatureAppScopeOptions<{}, string> = {
      baseUrl: '/base',
      config: 'testConfig',
      beforeCreate: mockBeforeCreate,
      done: mockDone,
    };

    expect(mockCreateFeatureAppScope.mock.calls).toEqual([
      ['testId', mockFeatureAppDefinition, expectedOptions],
    ]);
  });

  describe('with a React Feature App', () => {
    beforeEach(() => {
      mockFeatureAppScope = {
        featureApp: {
          render: () => <div>This is the React Feature App.</div>,
        },
        release: jest.fn(),
      };
    });

    it('renders the React element', () => {
      const testRenderer = renderWithFeatureHubContext(
        <FeatureAppContainer
          featureAppId="testId"
          featureAppDefinition={mockFeatureAppDefinition}
        />
      );

      expect(testRenderer.toJSON()).toMatchInlineSnapshot(`
<div>
  This is the React Feature App.
</div>
`);
    });

    describe('when children function is provided', () => {
      it('passes react node to children function', () => {
        const children = jest.fn(
          ({featureAppNode}: CustomFeatureAppRenderingParams) => (
            <div id="children-wrap">{featureAppNode}</div>
          )
        );

        const testRenderer = renderWithFeatureHubContext(
          <FeatureAppContainer
            featureAppId="testId"
            featureAppDefinition={mockFeatureAppDefinition}
            children={children}
          />
        );

        expect(children).toHaveBeenCalledTimes(1);

        expect(children.mock.calls[0][0]).toMatchInlineSnapshot(`
          Object {
            "featureAppNode": <div>
              This is the React Feature App.
            </div>,
            "loading": false,
          }
        `);

        expect(testRenderer.toJSON()).toMatchInlineSnapshot(`
          <div
            id="children-wrap"
          >
            <div>
              This is the React Feature App.
            </div>
          </div>
        `);
      });
    });

    describe('when the Feature App throws in render', () => {
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

      it("doesn't throw an error", () => {
        expect(() => {
          renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
            />
          );
        }).not.toThrow();
      });

      it('logs the error', () => {
        renderWithFeatureHubContext(
          <FeatureAppContainer
            featureAppId="testId"
            featureAppDefinition={mockFeatureAppDefinition}
          />
        );

        expect(logger.error.mock.calls).toEqual([[mockError]]);
      });

      describe('with onError provided', () => {
        it('calls onError with the error', () => {
          const onError = jest.fn();

          renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
              onError={onError}
            />
          );

          expect(onError.mock.calls).toEqual([[mockError]]);
        });

        it('does not log the error', () => {
          renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
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

          it('re-throws the error', () => {
            expect(() =>
              renderWithFeatureHubContext(
                <FeatureAppContainer
                  featureAppId="testId"
                  featureAppDefinition={mockFeatureAppDefinition}
                  onError={() => {
                    throw onErrorMockError;
                  }}
                />
              )
            ).toThrowError(onErrorMockError);

            expectConsoleErrorCalls(noErrorBoundaryConsoleErrorCalls);
          });
        });
      });

      describe('with a children function provided', () => {
        it('calls the children function with the error and loading=false', () => {
          const children = jest.fn(
            (_: CustomFeatureAppRenderingParams) => null
          );

          renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
              children={children}
            />
          );

          const expected: CustomFeatureAppRenderingParams = {
            featureAppNode: undefined,
            loading: false,
            error: mockError,
          };

          expect(children.mock.calls).toEqual([[expected]]);
        });

        it('renders what the children function returns', () => {
          const testRenderer = renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
              children={() => 'Custom Error UI'}
            />
          );

          expect(testRenderer.toJSON()).toBe('Custom Error UI');
        });

        it('renders what the children function returns if feature app definition is undefined', () => {
          const testRenderer = renderWithFeatureHubContext(
            <InternalFeatureAppContainer
              featureAppId="testId"
              children={() => 'loading UI'}
              logger={logger}
              featureAppManager={mockFeatureAppManager}
            />
          );

          expect(testRenderer.toJSON()).toBe('loading UI');
        });

        describe('when children throws an error', () => {
          let childrenMockError: Error;

          beforeEach(() => {
            childrenMockError = new Error('Throwing in children.');
          });

          it('re-throws the error', () => {
            expect(() =>
              renderWithFeatureHubContext(
                <FeatureAppContainer
                  featureAppId="testId"
                  featureAppDefinition={mockFeatureAppDefinition}
                  children={() => {
                    throw childrenMockError;
                  }}
                />
              )
            ).toThrowError(childrenMockError);

            expectConsoleErrorCalls(noErrorBoundaryConsoleErrorCalls);
          });
        });
      });
    });

    describe('when the Feature App throws in componentDidMount', () => {
      let mockError: Error;

      beforeEach(() => {
        mockError = new Error('Failed to mount.');

        class FeatureAppComponent extends React.Component {
          public componentDidMount(): void {
            throw mockError;
          }

          public render(): JSX.Element {
            return <p>Markup</p>;
          }
        }

        mockFeatureAppScope = {
          ...mockFeatureAppScope,
          featureApp: {
            render: () => <FeatureAppComponent />,
          },
        };
      });

      it("doesn't throw an error", () => {
        expect(() => {
          renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
            />
          );
        }).not.toThrow();

        expectConsoleErrorCalls(usingErrorBoundaryConsoleErrorCalls);
      });

      it('logs the error', () => {
        renderWithFeatureHubContext(
          <FeatureAppContainer
            featureAppId="testId"
            featureAppDefinition={mockFeatureAppDefinition}
          />
        );

        expect(logger.error.mock.calls).toEqual([[mockError]]);
        expectConsoleErrorCalls(usingErrorBoundaryConsoleErrorCalls);
      });

      describe('with onError provided', () => {
        it('calls onError with the error', () => {
          const onError = jest.fn();

          renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
              onError={onError}
            />
          );

          expect(onError.mock.calls).toEqual([[mockError]]);
          expectConsoleErrorCalls(usingErrorBoundaryConsoleErrorCalls);
        });

        it('does not log the error', () => {
          renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
              onError={jest.fn()}
            />
          );

          expect(logger.error).not.toHaveBeenCalled();
          expectConsoleErrorCalls(usingErrorBoundaryConsoleErrorCalls);
        });

        describe('when onError throws an error', () => {
          let onErrorMockError: Error;

          beforeEach(() => {
            onErrorMockError = new Error('Throwing in onError.');
          });

          it('re-throws the error', () => {
            expect(() =>
              renderWithFeatureHubContext(
                <FeatureAppContainer
                  featureAppId="testId"
                  featureAppDefinition={mockFeatureAppDefinition}
                  onError={() => {
                    throw onErrorMockError;
                  }}
                />
              )
            ).toThrowError(onErrorMockError);

            expectConsoleErrorCalls([
              ...usingErrorBoundaryConsoleErrorCalls,
              [expect.any(String), onErrorMockError],
              ...noErrorBoundaryConsoleErrorCalls,
            ]);
          });
        });
      });
    });

    describe('when unmounted', () => {
      it('calls release() on the Feature App scope', () => {
        const testRenderer = renderWithFeatureHubContext(
          <FeatureAppContainer
            featureAppId="testId"
            featureAppDefinition={mockFeatureAppDefinition}
          />
        );

        expect(mockFeatureAppScope.release).not.toHaveBeenCalled();

        testRenderer.unmount();

        expect(mockFeatureAppScope.release).toHaveBeenCalledTimes(1);
      });

      describe('when the Feature App scope throws an error while being destroyed', () => {
        let mockError: Error;

        beforeEach(() => {
          mockError = new Error('Failed to release Feature App');

          mockFeatureAppScope.release = () => {
            throw mockError;
          };
        });

        it('logs the error', () => {
          const testRenderer = renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
            />
          );

          testRenderer.unmount();

          expect(logger.error.mock.calls).toEqual([[mockError]]);
        });

        describe('with onError provided', () => {
          it('calls onError with the error', () => {
            const onError = jest.fn();

            const testRenderer = renderWithFeatureHubContext(
              <FeatureAppContainer
                featureAppId="testId"
                featureAppDefinition={mockFeatureAppDefinition}
                onError={onError}
              />
            );

            testRenderer.unmount();

            expect(onError.mock.calls).toEqual([[mockError]]);
          });

          it('does not log the error', () => {
            const testRenderer = renderWithFeatureHubContext(
              <FeatureAppContainer
                featureAppId="testId"
                featureAppDefinition={mockFeatureAppDefinition}
                onError={jest.fn()}
              />
            );

            testRenderer.unmount();

            expect(logger.error).not.toHaveBeenCalled();
          });

          describe('when onError throws an error', () => {
            let onErrorMockError: Error;

            beforeEach(() => {
              onErrorMockError = new Error('Throwing in onError.');
            });

            it('re-throws the error', () => {
              const testRenderer = renderWithFeatureHubContext(
                <FeatureAppContainer
                  featureAppId="testId"
                  featureAppDefinition={mockFeatureAppDefinition}
                  onError={() => {
                    throw onErrorMockError;
                  }}
                />
              );

              expect(() => testRenderer.unmount()).toThrowError(
                onErrorMockError
              );

              expectConsoleErrorCalls([
                [expect.any(String), onErrorMockError],
                ...noErrorBoundaryConsoleErrorCalls,
              ]);
            });
          });
        });
      });
    });

    describe('when a feature app has a loading promise', () => {
      let resolveLoadingPromise: () => Promise<void>;
      let rejectLoadingPromise: (reason?: Error) => Promise<void>;

      beforeEach(() => {
        const loadingPromise: Promise<void> = new Promise((resolve, reject) => {
          resolveLoadingPromise = async () => {
            resolve();
            // promise returns itself so we don't forget to await next
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
            render: () => (
              <div>This is the React Feature App with a loading promise.</div>
            ),
            loadingPromise,
          },
        };
      });

      describe('when no children function is passed', () => {
        describe('when no feature app definition is passed', () => {
          it('renders null', () => {
            const testRenderer = renderWithFeatureHubContext(
              <InternalFeatureAppContainer
                featureAppId="testId"
                logger={logger}
                featureAppManager={mockFeatureAppManager}
              />
            );

            expect(testRenderer.getInstance()).toBeNull();
          });
        });

        describe('when the promise resolves', () => {
          it('renders the feature app', async () => {
            const testRenderer = renderWithFeatureHubContext(
              <FeatureAppContainer
                featureAppId="testId"
                featureAppDefinition={mockFeatureAppDefinition}
              />
            );

            expect(testRenderer.toJSON()).toMatchInlineSnapshot(`
              <div>
                This is the React Feature App with a loading promise.
              </div>
            `);

            await resolveLoadingPromise();

            expect(testRenderer.toJSON()).toMatchInlineSnapshot(`
              <div>
                This is the React Feature App with a loading promise.
              </div>
            `);
          });
        });

        describe('when the promise rejects', () => {
          let loadingPromiseMockError: Error;

          beforeEach(() => {
            loadingPromiseMockError = new Error(
              'loading promise rejected with error'
            );
          });

          describe('with no onError', () => {
            it('does not throw, but logs the error', async () => {
              renderWithFeatureHubContext(
                <FeatureAppContainer
                  featureAppId="testId"
                  featureAppDefinition={mockFeatureAppDefinition}
                />
              );

              await rejectLoadingPromise(loadingPromiseMockError);

              expect(logger.error.mock.calls).toEqual([
                [loadingPromiseMockError],
              ]);
            });
          });

          describe('with onError', () => {
            it('calls onError', async () => {
              const onError = jest.fn();

              renderWithFeatureHubContext(
                <FeatureAppContainer
                  featureAppId="testId"
                  featureAppDefinition={mockFeatureAppDefinition}
                  onError={onError}
                />
              );

              await rejectLoadingPromise(loadingPromiseMockError);

              expect(onError).toHaveBeenCalledWith(loadingPromiseMockError);
            });

            describe('when unmounted before loading promise is rejected', () => {
              it('calls onError with the error', async () => {
                const onError = jest.fn();

                const testRenderer = renderWithFeatureHubContext(
                  <FeatureAppContainer
                    featureAppId="testId"
                    featureAppDefinition={mockFeatureAppDefinition}
                    onError={onError}
                  />
                );

                expect(onError.mock.calls).toEqual([]);

                testRenderer.unmount();

                expect(onError.mock.calls).toEqual([]);

                await rejectLoadingPromise(loadingPromiseMockError);

                expect(onError.mock.calls).toEqual([[loadingPromiseMockError]]);
              });
            });

            describe('when onError throws an error', () => {
              let onErrorMockError: Error;

              beforeEach(() => {
                onErrorMockError = new Error('Throwing in onError.');
              });

              it('throws the error in render', async () => {
                const handleError = jest.fn();

                const testRenderer = renderWithFeatureHubContext(
                  <TestErrorBoundary handleError={handleError}>
                    <FeatureAppContainer
                      featureAppId="testId"
                      featureAppDefinition={mockFeatureAppDefinition}
                      onError={() => {
                        throw onErrorMockError;
                      }}
                    />
                  </TestErrorBoundary>
                );

                expectConsoleErrorCalls([]);

                await rejectLoadingPromise(loadingPromiseMockError);

                expect(handleError.mock.calls).toEqual([[onErrorMockError]]);

                expect(testRenderer.toJSON()).toBe('test error boundary');

                expectConsoleErrorCalls(
                  usingTestErrorBoundaryConsoleErrorCalls
                );
              });

              describe('when unmounted before loading promise is rejected', () => {
                it('calls onError with the loading promise error', async () => {
                  const onError = jest.fn(() => {
                    throw onErrorMockError;
                  });

                  const testRenderer = renderWithFeatureHubContext(
                    <FeatureAppContainer
                      featureAppId="testId"
                      featureAppDefinition={mockFeatureAppDefinition}
                      onError={onError}
                    />
                  );

                  expect(onError.mock.calls).toEqual([]);

                  testRenderer.unmount();

                  expect(onError.mock.calls).toEqual([]);

                  await rejectLoadingPromise(loadingPromiseMockError);

                  expect(onError.mock.calls).toEqual([
                    [loadingPromiseMockError],
                  ]);
                });
              });
            });
          });
        });
      });

      describe('when children function is passed', () => {
        describe('when promise resolves', () => {
          it('initially passes loading=true to children function, then loading=false', async () => {
            const children = jest.fn(
              (_: CustomFeatureAppRenderingParams) => null
            );

            renderWithFeatureHubContext(
              <FeatureAppContainer
                featureAppId="testId"
                featureAppDefinition={mockFeatureAppDefinition}
                children={children}
              />
            );

            expect(children).toHaveBeenCalledTimes(1);

            expect(children.mock.calls[0][0].loading).toBe(true);

            await resolveLoadingPromise();

            expect(children).toHaveBeenCalledTimes(2);

            expect(children.mock.calls[1][0].loading).toBe(false);
          });

          it('renders what children returns', async () => {
            const children = jest.fn(
              ({loading}: CustomFeatureAppRenderingParams) => (
                <span>{loading ? 'is loading' : 'not loading'}</span>
              )
            );

            const testRenderer = renderWithFeatureHubContext(
              <FeatureAppContainer
                featureAppId="testId"
                featureAppDefinition={mockFeatureAppDefinition}
                children={children}
              />
            );

            expect(testRenderer.toJSON()).toMatchInlineSnapshot(`
              <span>
                is loading
              </span>
            `);

            await resolveLoadingPromise();

            expect(testRenderer.toJSON()).toMatchInlineSnapshot(`
              <span>
                not loading
              </span>
            `);
          });
        });

        describe('when promise rejects', () => {
          let mockError: Error;

          beforeEach(() => {
            mockError = new Error('loading promise rejected with error');
          });

          it('initially passes loading=true to children, then loading=false', async () => {
            const children = jest.fn(
              (_: CustomFeatureAppRenderingParams) => null
            );

            renderWithFeatureHubContext(
              <FeatureAppContainer
                featureAppId="testId"
                featureAppDefinition={mockFeatureAppDefinition}
                children={children}
              />
            );

            expect(children).toHaveBeenCalledTimes(1);

            expect(children.mock.calls[0][0].loading).toBe(true);

            await rejectLoadingPromise(mockError);

            expect(children).toHaveBeenCalledTimes(2);

            expect(children.mock.calls[1][0].loading).toBe(false);
          });

          it('calls children with rejection error', async () => {
            const children = jest.fn(
              (_: CustomFeatureAppRenderingParams) => null
            );

            renderWithFeatureHubContext(
              <FeatureAppContainer
                featureAppId="testId"
                featureAppDefinition={mockFeatureAppDefinition}
                children={children}
              />
            );

            expect(children).toHaveBeenCalledTimes(1);

            expect(children.mock.calls[0][0].error).toBeUndefined();

            await rejectLoadingPromise(mockError);

            expect(children).toHaveBeenCalledTimes(2);

            expect(children.mock.calls[1][0].error).toBe(mockError);
          });

          it(`doesn't pass featureAppNode to children after rejection`, async () => {
            const children = jest.fn(
              (_: CustomFeatureAppRenderingParams) => null
            );

            renderWithFeatureHubContext(
              <FeatureAppContainer
                featureAppId="testId"
                featureAppDefinition={mockFeatureAppDefinition}
                children={children}
              />
            );

            expect(children).toHaveBeenCalledTimes(1);

            expect(children.mock.calls[0][0].featureAppNode)
              .toMatchInlineSnapshot(`
              <div>
                This is the React Feature App with a loading promise.
              </div>
            `);

            await rejectLoadingPromise(mockError);

            expect(children).toHaveBeenCalledTimes(2);

            expect(children.mock.calls[1][0].featureAppNode).toBeUndefined();
          });
        });
      });

      describe('when unmounted before loading promise is resolved', () => {
        it('does not try to set state', async () => {
          const testRenderer = renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
            />
          );

          testRenderer.unmount();
          await resolveLoadingPromise();

          expect(consoleErrorSpy).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('with a DOM Feature App', () => {
    beforeEach(() => {
      mockFeatureAppScope = {
        featureApp: {
          attachTo(container: HTMLElement): void {
            container.innerHTML = 'This is the DOM Feature App.';
          },
        },
        release: jest.fn(),
      };
    });

    it("renders a container and passes it to the Feature App's render method", () => {
      const mockSetInnerHtml = jest.fn();

      const testRenderer = renderWithFeatureHubContext(
        <FeatureAppContainer
          featureAppId="testId"
          featureAppDefinition={mockFeatureAppDefinition}
        />,
        {
          testRendererOptions: {
            createNodeMock: () => ({
              set innerHTML(html: string) {
                mockSetInnerHtml(html);
              },
            }),
          },
        }
      );

      expect(testRenderer.toJSON()).toMatchInlineSnapshot(`<div />`);

      expect(mockSetInnerHtml).toHaveBeenCalledWith(
        'This is the DOM Feature App.'
      );
    });

    describe('when children function is provided', () => {
      it('passes react node to children function', () => {
        const mockSetInnerHtml = jest.fn();

        const children = jest.fn(
          ({featureAppNode}: CustomFeatureAppRenderingParams) => (
            <div id="children-wrap">{featureAppNode}</div>
          )
        );

        const testRenderer = renderWithFeatureHubContext(
          <FeatureAppContainer
            featureAppId="testId"
            featureAppDefinition={mockFeatureAppDefinition}
            children={children}
          />,
          {
            testRendererOptions: {
              createNodeMock: () => ({
                set innerHTML(html: string) {
                  mockSetInnerHtml(html);
                },
              }),
            },
          }
        );

        expect(children).toHaveBeenCalledTimes(1);

        expect(children.mock.calls[0][0]).toMatchInlineSnapshot(`
          Object {
            "featureAppNode": <div />,
            "loading": false,
          }
        `);

        expect(mockSetInnerHtml).toHaveBeenCalledWith(
          'This is the DOM Feature App.'
        );

        expect(testRenderer.toJSON()).toMatchInlineSnapshot(`
          <div
            id="children-wrap"
          >
            <div />
          </div>
        `);
      });
    });

    describe('when a Feature App throws in attachTo', () => {
      let mockError: Error;

      beforeEach(() => {
        mockError = new Error('Failed to attach.');

        mockFeatureAppScope = {
          ...mockFeatureAppScope,
          featureApp: {
            attachTo: () => {
              throw mockError;
            },
          },
        };
      });

      it("doesn't throw an error", () => {
        expect(() =>
          renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
            />,
            {testRendererOptions: {createNodeMock: () => ({})}}
          )
        ).not.toThrowError(mockError);
      });

      it('logs the error', () => {
        renderWithFeatureHubContext(
          <FeatureAppContainer
            featureAppId="testId"
            featureAppDefinition={mockFeatureAppDefinition}
          />,
          {testRendererOptions: {createNodeMock: () => ({})}}
        );

        expect(logger.error.mock.calls).toEqual([[mockError]]);
      });

      describe('with an onError function provided', () => {
        it('calls the function with the error', () => {
          const onError = jest.fn();

          renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
              onError={onError}
            />,
            {testRendererOptions: {createNodeMock: () => ({})}}
          );

          expect(onError.mock.calls).toEqual([[mockError]]);
        });

        describe('when onError throws an error', () => {
          let onErrorMockError: Error;

          beforeEach(() => {
            onErrorMockError = new Error('Throwing in onError.');
          });

          it('re-throws the error', () => {
            expect(() =>
              renderWithFeatureHubContext(
                <FeatureAppContainer
                  featureAppId="testId"
                  featureAppDefinition={mockFeatureAppDefinition}
                  onError={() => {
                    throw onErrorMockError;
                  }}
                />,
                {testRendererOptions: {createNodeMock: () => ({})}}
              )
            ).toThrowError(onErrorMockError);

            expectConsoleErrorCalls([
              [expect.any(String), onErrorMockError],
              ...noErrorBoundaryConsoleErrorCalls,
            ]);
          });
        });
      });

      describe('with a children function provided', () => {
        it('calls the function with the error', () => {
          const children = jest.fn(
            ({featureAppNode}: CustomFeatureAppRenderingParams) =>
              featureAppNode || null
          );

          renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
              children={children}
            />,
            {testRendererOptions: {createNodeMock: () => ({})}}
          );

          const expectedAfterMount: CustomFeatureAppRenderingParams = {
            error: mockError,
            loading: false,
          };

          expect(children).toHaveBeenLastCalledWith(expectedAfterMount);
        });

        it('renders the result of the function', () => {
          const customErrorUI = 'custom error UI';

          const children = jest.fn(
            ({featureAppNode}: CustomFeatureAppRenderingParams) =>
              featureAppNode || customErrorUI
          );

          const testRenderer = renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
              children={children}
            />,
            {testRendererOptions: {createNodeMock: () => ({})}}
          );

          expect(testRenderer.toJSON()).toBe(customErrorUI);
        });
      });

      describe('without a children function provided', () => {
        it('renders null', () => {
          const testRenderer = renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
            />,
            {testRendererOptions: {createNodeMock: () => ({})}}
          );

          expect(testRenderer.toJSON()).toBeNull();
        });
      });
    });

    describe('when unmounted', () => {
      it('calls release() on the Feature App scope', () => {
        const testRenderer = renderWithFeatureHubContext(
          <FeatureAppContainer
            featureAppId="testId"
            featureAppDefinition={mockFeatureAppDefinition}
          />
        );

        expect(mockFeatureAppScope.release).not.toHaveBeenCalled();

        testRenderer.unmount();

        expect(mockFeatureAppScope.release).toHaveBeenCalledTimes(1);
      });

      describe('when the Feature App scope throws an error while being released', () => {
        let mockError: Error;

        beforeEach(() => {
          mockError = new Error('Failed to release Feature App');

          mockFeatureAppScope.release = () => {
            throw mockError;
          };
        });

        it('logs the error', () => {
          const testRenderer = renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
            />
          );

          testRenderer.unmount();

          expect(logger.error.mock.calls).toEqual([[mockError]]);
        });

        describe('with an onError function provided', () => {
          it('calls the function with the error', () => {
            const onError = jest.fn();

            const testRenderer = renderWithFeatureHubContext(
              <FeatureAppContainer
                featureAppId="testId"
                featureAppDefinition={mockFeatureAppDefinition}
                onError={onError}
              />
            );

            testRenderer.unmount();

            expect(onError.mock.calls).toEqual([[mockError]]);
          });
        });
      });
    });
  });

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

      it('renders nothing and logs an error', () => {
        const testRenderer = renderWithFeatureHubContext(
          <FeatureAppContainer
            featureAppId="testId"
            featureAppDefinition={mockFeatureAppDefinition}
          />
        );

        expect(testRenderer.toJSON()).toBeNull();

        const expectedError = new Error(
          'Invalid Feature App found. The Feature App must be an object with either 1) a `render` method that returns a React element, or 2) an `attachTo` method that accepts a container DOM element.'
        );

        expect(logger.error.mock.calls).toEqual([[expectedError]]);
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

    it('logs the creation error', () => {
      renderWithFeatureHubContext(
        <FeatureAppContainer
          featureAppId="testId"
          featureAppDefinition={mockFeatureAppDefinition}
        />
      );

      expect(logger.error.mock.calls).toEqual([[mockError]]);
    });

    describe('with an onError function provided', () => {
      it('calls the function with the error', () => {
        const onError = jest.fn();

        renderWithFeatureHubContext(
          <FeatureAppContainer
            featureAppId="testId"
            featureAppDefinition={mockFeatureAppDefinition}
            onError={onError}
          />
        );

        expect(onError.mock.calls).toEqual([[mockError]]);
      });

      describe('when onError throws an error', () => {
        let onErrorMockError: Error;

        beforeEach(() => {
          onErrorMockError = new Error('Throwing in onError.');
        });

        it('re-throws the error', () => {
          expect(() =>
            renderWithFeatureHubContext(
              <FeatureAppContainer
                featureAppId="testId"
                featureAppDefinition={mockFeatureAppDefinition}
                onError={() => {
                  throw onErrorMockError;
                }}
              />
            )
          ).toThrowError(onErrorMockError);

          expectConsoleErrorCalls(noErrorBoundaryConsoleErrorCalls);
        });
      });
    });

    describe('when unmounted', () => {
      it('does nothing', () => {
        const testRenderer = renderWithFeatureHubContext(
          <FeatureAppContainer
            featureAppId="testId"
            featureAppDefinition={mockFeatureAppDefinition}
          />
        );

        testRenderer.unmount();
      });
    });
  });

  describe('without a custom logger', () => {
    it('logs messages using the console', () => {
      const mockError = new Error('Failed to render.');

      mockFeatureAppScope = {
        ...mockFeatureAppScope,
        featureApp: {
          render: () => {
            throw mockError;
          },
        },
      };

      renderWithFeatureHubContext(
        <FeatureAppContainer
          featureAppId="testId"
          featureAppDefinition={mockFeatureAppDefinition}
        />,
        {customLogger: false}
      );

      expectConsoleErrorCalls([[mockError]]);
    });
  });
});
