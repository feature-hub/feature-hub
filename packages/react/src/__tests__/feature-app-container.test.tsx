// tslint:disable:no-implicit-dependencies
import {
  FeatureAppDefinition,
  FeatureAppManager,
  FeatureAppScope,
  FeatureAppScopeOptions
} from '@feature-hub/core';
import {Stubbed, stubMethods} from 'jest-stub-methods';
import * as React from 'react';
import TestRenderer from 'react-test-renderer';
import {FeatureAppContainer, FeatureHubContextProvider} from '..';
import {logger} from './logger';

describe('FeatureAppContainer', () => {
  let mockFeatureAppManager: FeatureAppManager;
  let mockGetFeatureAppScope: jest.Mock;
  let mockFeatureAppDefinition: FeatureAppDefinition<unknown>;
  let mockFeatureAppScope: FeatureAppScope<unknown>;
  let stubbedConsole: Stubbed<Console>;

  const usingErrorBoundaryConsoleErrorCalls = [
    [expect.any(String), expect.any(Error)],
    [
      expect.stringContaining(
        'React will try to recreate this component tree from scratch using the error boundary you provided'
      )
    ]
  ];

  const noErrorBoundaryConsoleErrorCalls = [
    [
      expect.stringContaining(
        'Consider adding an error boundary to your tree to customize error handling behavior.'
      )
    ]
  ];

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
    stubbedConsole = stubMethods(console);
    mockFeatureAppDefinition = {create: jest.fn()};
    mockFeatureAppScope = {featureApp: {}, destroy: jest.fn()};
    mockGetFeatureAppScope = jest.fn(() => mockFeatureAppScope);

    mockFeatureAppManager = ({
      getAsyncFeatureAppDefinition: jest.fn(),
      getFeatureAppScope: mockGetFeatureAppScope,
      preloadFeatureApp: jest.fn()
    } as Partial<FeatureAppManager>) as FeatureAppManager;
  });

  afterEach(() => {
    expect(stubbedConsole.stub.error).not.toHaveBeenCalled();
    stubbedConsole.restore();
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
      testRendererOptions
    }: {
      customLogger?: boolean;
      testRendererOptions?: TestRenderer.TestRendererOptions;
    } = {}
  ) =>
    TestRenderer.create(
      <FeatureHubContextProvider
        value={{
          featureAppManager: mockFeatureAppManager,
          logger: customLogger ? logger : undefined
        }}
      >
        {node}
      </FeatureHubContextProvider>,
      testRendererOptions
    );

  it('calls the Feature App manager with the given featureAppDefinition, featureAppId, config, baseUrl, and beforeCreate callback', () => {
    const mockBeforeCreate = jest.fn();

    renderWithFeatureHubContext(
      <FeatureAppContainer
        featureAppDefinition={mockFeatureAppDefinition}
        featureAppId="testId"
        config="testConfig"
        baseUrl="/base"
        beforeCreate={mockBeforeCreate}
      />
    );

    const expectedOptions: FeatureAppScopeOptions = {
      baseUrl: '/base',
      config: 'testConfig',
      beforeCreate: mockBeforeCreate
    };

    expect(mockGetFeatureAppScope.mock.calls).toEqual([
      [mockFeatureAppDefinition, 'testId', expectedOptions]
    ]);
  });

  describe('with a React Feature App', () => {
    beforeEach(() => {
      mockFeatureAppScope = {
        featureApp: {
          render: () => <div>This is the React Feature App.</div>
        },
        destroy: jest.fn()
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

    describe('when the Feature App throws in render', () => {
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

      describe('with no renderError function provided', () => {
        it('renders null', () => {
          const testRenderer = renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
            />
          );

          expect(testRenderer.toJSON()).toBeNull();
        });
      });

      describe('with a renderError function provided', () => {
        it('calls the function with the error', () => {
          const testRenderer = renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
              renderError={() => 'Custom Error UI'}
            />
          );

          expect(testRenderer.toJSON()).toBe('Custom Error UI');
        });

        it('renders what the function returns', () => {
          const renderError = jest.fn().mockReturnValue(null);

          renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
              renderError={renderError}
            />
          );

          expect(renderError.mock.calls).toEqual([[mockError]]);
        });

        describe('when renderError throws an error', () => {
          let renderErrorMockError: Error;

          beforeEach(() => {
            renderErrorMockError = new Error('Throwing in renderError.');
          });

          it('re-throws the error', () => {
            expect(() =>
              renderWithFeatureHubContext(
                <FeatureAppContainer
                  featureAppId="testId"
                  featureAppDefinition={mockFeatureAppDefinition}
                  renderError={() => {
                    throw renderErrorMockError;
                  }}
                />
              )
            ).toThrowError(renderErrorMockError);

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
            render: () => <FeatureAppComponent />
          }
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
              ...noErrorBoundaryConsoleErrorCalls
            ]);
          });
        });
      });

      describe('with no renderError function provided', () => {
        it('renders null', () => {
          const testRenderer = renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
            />
          );

          expect(testRenderer.toJSON()).toBeNull();
          expectConsoleErrorCalls(usingErrorBoundaryConsoleErrorCalls);
        });
      });

      describe('with a renderError function provided', () => {
        it('calls the function with the error', () => {
          const testRenderer = renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
              renderError={() => 'Custom Error UI'}
            />
          );

          expect(testRenderer.toJSON()).toBe('Custom Error UI');
          expectConsoleErrorCalls(usingErrorBoundaryConsoleErrorCalls);
        });

        it('renders what the function returns', () => {
          const renderError = jest.fn().mockReturnValue(null);

          renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
              renderError={renderError}
            />
          );

          expect(renderError.mock.calls).toEqual([[mockError]]);
          expectConsoleErrorCalls(usingErrorBoundaryConsoleErrorCalls);
        });
      });
    });

    describe('when unmounted', () => {
      it('calls destroy() on the Feature App scope', () => {
        const testRenderer = renderWithFeatureHubContext(
          <FeatureAppContainer
            featureAppId="testId"
            featureAppDefinition={mockFeatureAppDefinition}
          />
        );

        expect(mockFeatureAppScope.destroy).not.toHaveBeenCalled();

        testRenderer.unmount();

        expect(mockFeatureAppScope.destroy).toHaveBeenCalledTimes(1);
      });

      describe('when the Feature App scope throws an error while being destroyed', () => {
        let mockError: Error;

        beforeEach(() => {
          mockError = new Error('Failed to destroy Feature App scope');

          mockFeatureAppScope.destroy = () => {
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
                ...noErrorBoundaryConsoleErrorCalls
              ]);
            });
          });
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
          }
        },
        destroy: jest.fn()
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
              }
            })
          }
        }
      );

      expect(testRenderer.toJSON()).toMatchInlineSnapshot(`<div />`);

      expect(mockSetInnerHtml).toHaveBeenCalledWith(
        'This is the DOM Feature App.'
      );
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
            }
          }
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
              ...noErrorBoundaryConsoleErrorCalls
            ]);
          });
        });
      });

      describe('with a renderError function provided', () => {
        it('calls the function with the error', () => {
          const renderError = jest.fn().mockReturnValue(null);

          renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
              renderError={renderError}
            />,
            {testRendererOptions: {createNodeMock: () => ({})}}
          );

          expect(renderError.mock.calls).toEqual([[mockError]]);
        });

        it('renders the result of the function', () => {
          const customErrorUI = 'custom error UI';

          const testRenderer = renderWithFeatureHubContext(
            <FeatureAppContainer
              featureAppId="testId"
              featureAppDefinition={mockFeatureAppDefinition}
              renderError={() => customErrorUI}
            />,
            {testRendererOptions: {createNodeMock: () => ({})}}
          );

          expect(testRenderer.toJSON()).toBe(customErrorUI);
        });
      });

      describe('without a renderError function provided', () => {
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
      it('calls destroy() on the Feature App scope', () => {
        const testRenderer = renderWithFeatureHubContext(
          <FeatureAppContainer
            featureAppId="testId"
            featureAppDefinition={mockFeatureAppDefinition}
          />
        );

        expect(mockFeatureAppScope.destroy).not.toHaveBeenCalled();

        testRenderer.unmount();

        expect(mockFeatureAppScope.destroy).toHaveBeenCalledTimes(1);
      });

      describe('when the Feature App scope throws an error while being destroyed', () => {
        let mockError: Error;

        beforeEach(() => {
          mockError = new Error('Failed to destroy Feature App scope');

          mockFeatureAppScope.destroy = () => {
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

      mockGetFeatureAppScope.mockImplementation(() => {
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

    describe('with a renderError function provided', () => {
      it('calls the function with the creation error', () => {
        const renderError = jest.fn().mockReturnValue(null);

        renderWithFeatureHubContext(
          <FeatureAppContainer
            featureAppId="testId"
            featureAppDefinition={mockFeatureAppDefinition}
            renderError={renderError}
          />
        );

        expect(renderError.mock.calls).toEqual([[mockError]]);
      });

      it('renders the result of the function', () => {
        const customErrorUI = 'custom error UI';

        const testRenderer = renderWithFeatureHubContext(
          <FeatureAppContainer
            featureAppId="testId"
            featureAppDefinition={mockFeatureAppDefinition}
            renderError={() => customErrorUI}
          />
        );

        expect(testRenderer.toJSON()).toBe(customErrorUI);
      });

      describe('when renderError throws an error', () => {
        let renderErrorMockError: Error;

        beforeEach(() => {
          renderErrorMockError = new Error('Throwing in renderError.');
        });

        it('re-throws the error', () => {
          expect(() =>
            renderWithFeatureHubContext(
              <FeatureAppContainer
                featureAppId="testId"
                featureAppDefinition={mockFeatureAppDefinition}
                renderError={() => {
                  throw renderErrorMockError;
                }}
              />
            )
          ).toThrowError(renderErrorMockError);

          expectConsoleErrorCalls(noErrorBoundaryConsoleErrorCalls);
        });
      });
    });

    describe('without a renderError function provided', () => {
      it('renders null', () => {
        const testRenderer = renderWithFeatureHubContext(
          <FeatureAppContainer
            featureAppId="testId"
            featureAppDefinition={mockFeatureAppDefinition}
          />
        );

        expect(testRenderer.toJSON()).toBeNull();
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
          }
        }
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
