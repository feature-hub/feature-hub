// tslint:disable:no-implicit-dependencies
// tslint:disable:no-non-null-assertion

import {
  FeatureServiceBinder,
  FeatureServiceEnvironment,
  FeatureServiceProviderDefinition,
} from '@feature-hub/core';
import {
  AsyncSsrManagerV1,
  SharedAsyncSsrManager,
  defineAsyncSsrManager,
} from '..';
import {stubbedLogger} from './stubbed-logger';
import {useFakeTimers} from './use-fake-timers';

const queueMacroTask = setImmediate;

async function simulateAsyncOperation(result: number): Promise<number> {
  await new Promise(queueMacroTask);

  return result;
}

describe('defineAsyncSsrManager', () => {
  let mockEnv: FeatureServiceEnvironment<{}>;

  let asyncSsrManagerDefinition: FeatureServiceProviderDefinition<SharedAsyncSsrManager>;

  beforeEach(() => {
    asyncSsrManagerDefinition = defineAsyncSsrManager({timeout: 5});
  });

  beforeEach(() => {
    mockEnv = {featureServices: {'s2:logger': stubbedLogger}};
  });

  it('creates an Async SSR Manager definition', () => {
    expect(asyncSsrManagerDefinition.id).toBe('s2:async-ssr-manager');
    expect(asyncSsrManagerDefinition.dependencies).toBeUndefined();

    expect(asyncSsrManagerDefinition.optionalDependencies).toEqual({
      featureServices: {'s2:logger': '^1.0.0'},
    });
  });

  describe('#create', () => {
    it('creates a shared Feature Service containing version 1.0.0', () => {
      const sharedAsyncSsrManager = asyncSsrManagerDefinition.create(mockEnv);

      expect(sharedAsyncSsrManager!['1.0.0']).toBeDefined();
    });
  });

  describe('AsyncSsrManagerV1', () => {
    let asyncSsrManagerBinder: FeatureServiceBinder<AsyncSsrManagerV1>;

    beforeEach(() => {
      asyncSsrManagerBinder =
        asyncSsrManagerDefinition.create(mockEnv)!['1.0.0'];
    });

    describe('rendering', () => {
      describe('with an integrator as the only consumer', () => {
        it('resolves with the result of the given render function after the first render pass', async () => {
          const asyncSsrManager = asyncSsrManagerBinder('test').featureService;
          const mockRender = jest.fn(() => 'testHtml');

          const html = await useFakeTimers(async () =>
            asyncSsrManager.renderUntilCompleted(mockRender),
          );

          expect(html).toEqual('testHtml');
          expect(mockRender).toHaveBeenCalledTimes(1);
        });

        describe('when the given render function returns a promise', () => {
          it('resolves with the html string that is resolved from the render function', async () => {
            const asyncSsrManager =
              asyncSsrManagerBinder('test').featureService;

            const mockRender = jest.fn(async () => 'testHtml');

            const html = await useFakeTimers(async () =>
              asyncSsrManager.renderUntilCompleted(mockRender),
            );

            expect(html).toEqual('testHtml');
            expect(mockRender).toHaveBeenCalledTimes(1);
          });
        });
      });

      describe('with an integrator, and a consumer that schedules a rerender with a custom promise', () => {
        it('resolves with an html string after the second render pass', async () => {
          const asyncSsrManagerIntegrator =
            asyncSsrManagerBinder('test:integrator').featureService;

          const asyncSsrManagerConsumer =
            asyncSsrManagerBinder('test:consumer').featureService;

          let renderPass = 0;

          const mockRender = jest.fn(() => {
            renderPass += 1;

            if (renderPass === 1) {
              asyncSsrManagerConsumer.scheduleRerender(Promise.resolve());
            }

            return `render pass ${renderPass}`;
          });

          const html = await useFakeTimers(async () =>
            asyncSsrManagerIntegrator.renderUntilCompleted(mockRender),
          );

          expect(html).toEqual('render pass 2');
          expect(mockRender).toHaveBeenCalledTimes(2);
        });
      });

      describe('with an integrator, and a consumer that schedules a rerender without a custom promise', () => {
        it('resolves with an html string after the second render pass', async () => {
          const asyncSsrManagerIntegrator =
            asyncSsrManagerBinder('test:integrator').featureService;

          const asyncSsrManagerConsumer =
            asyncSsrManagerBinder('test:consumer').featureService;

          let renderPass = 0;

          const mockRender = jest.fn(() => {
            renderPass += 1;

            if (renderPass === 1) {
              asyncSsrManagerConsumer.scheduleRerender();
            }

            return `render pass ${renderPass}`;
          });

          const html = await useFakeTimers(async () =>
            asyncSsrManagerIntegrator.renderUntilCompleted(mockRender),
          );

          expect(html).toEqual('render pass 2');
          expect(mockRender).toHaveBeenCalledTimes(2);
        });
      });

      describe('with an integrator, and a consumer that schedules a rerender in two consecutive render passes', () => {
        it('resolves with an html string after the third render pass', async () => {
          const asyncSsrManagerIntegrator =
            asyncSsrManagerBinder('test:integrator').featureService;

          const asyncSsrManagerConsumer =
            asyncSsrManagerBinder('test:consumer').featureService;

          let renderPass = 0;

          const mockRender = jest.fn(() => {
            renderPass += 1;

            if (renderPass < 3) {
              asyncSsrManagerConsumer.scheduleRerender();
            }

            return `render pass ${renderPass}`;
          });

          const html = await useFakeTimers(async () =>
            asyncSsrManagerIntegrator.renderUntilCompleted(mockRender),
          );

          expect(html).toEqual('render pass 3');
          expect(mockRender).toHaveBeenCalledTimes(3);
        });
      });

      describe('with an integrator, and a consumer that first schedules a rerender with a custom promise, awaits the promise, and then schedules a rerender with another promise', () => {
        it('resolves with an html string after the second render pass', async () => {
          expect.assertions(2);

          const asyncSsrManagerIntegrator =
            asyncSsrManagerBinder('test:integrator').featureService;

          const asyncSsrManagerConsumer =
            asyncSsrManagerBinder('test:consumer').featureService;

          let renderPass = 0;
          let consumerResult = 0;

          const mockRender = jest.fn(async () => {
            renderPass += 1;

            if (renderPass === 1) {
              const promise1 = simulateAsyncOperation(1);
              asyncSsrManagerConsumer.scheduleRerender(promise1);
              consumerResult = await promise1;

              const promise2 = simulateAsyncOperation(2);
              asyncSsrManagerConsumer.scheduleRerender(promise2);
              consumerResult = await promise2;
            }

            return `render pass ${renderPass}, consumer result ${consumerResult}`;
          });

          const html = await useFakeTimers(async () =>
            asyncSsrManagerIntegrator.renderUntilCompleted(mockRender),
          );

          expect(html).toEqual('render pass 2, consumer result 2');
          expect(mockRender).toHaveBeenCalledTimes(2);
        });
      });

      describe('with an integrator, and two consumers that both schedule a rerender in the first render pass', () => {
        it('resolves with an html string after the second render pass', async () => {
          const asyncSsrManagerIntegrator =
            asyncSsrManagerBinder('test:integrator').featureService;

          const asyncSsrManagerConsumer1 =
            asyncSsrManagerBinder('test:consumer:1').featureService;

          const asyncSsrManagerConsumer2 =
            asyncSsrManagerBinder('test:consumer:2').featureService;

          let renderPass = 0;

          const mockRender = jest.fn(() => {
            renderPass += 1;

            if (renderPass === 1) {
              asyncSsrManagerConsumer1.scheduleRerender();
              asyncSsrManagerConsumer2.scheduleRerender();
            }

            return `render pass ${renderPass}`;
          });

          const html = await useFakeTimers(async () =>
            asyncSsrManagerIntegrator.renderUntilCompleted(mockRender),
          );

          expect(html).toEqual('render pass 2');
          expect(mockRender).toHaveBeenCalledTimes(2);
        });
      });

      describe('with an integrator that renders two consumers independently, both scheduling a rerender in the first render pass', () => {
        it('resolves with an html string after the second render pass', async () => {
          const asyncSsrManagerIntegrator =
            asyncSsrManagerBinder('test:integrator').featureService;

          const asyncSsrManagerConsumers = [
            asyncSsrManagerBinder('test:consumer:0').featureService,
            asyncSsrManagerBinder('test:consumer:1').featureService,
          ] as const;

          const createMockRender = (consumer: 0 | 1) => {
            let renderPass = 0;

            return jest.fn(() => {
              renderPass += 1;

              if (renderPass === 1) {
                asyncSsrManagerConsumers[consumer].scheduleRerender();
              }

              return `render call ${consumer}, pass ${renderPass}`;
            });
          };

          const mockRender0 = createMockRender(0);
          const mockRender1 = createMockRender(1);

          const html = await useFakeTimers(async () =>
            Promise.all([
              asyncSsrManagerIntegrator.renderUntilCompleted(mockRender0),
              asyncSsrManagerIntegrator.renderUntilCompleted(mockRender1),
            ]),
          );

          expect(mockRender0).toHaveBeenCalledTimes(2);
          expect(mockRender1).toHaveBeenCalledTimes(2);

          expect(html).toEqual([
            'render call 0, pass 2',
            'render call 1, pass 2',
          ]);
        });
      });

      describe('with a consumer that schedules a rerender outside of `renderUntilCompleted`', () => {
        it('rejects with an error', async () => {
          const asyncSsrManager =
            asyncSsrManagerBinder('test:consumer').featureService;

          const mockRender = jest.fn(() => {
            asyncSsrManager.scheduleRerender();
          });

          return expect(
            useFakeTimers(async () => mockRender()),
          ).rejects.toEqual(
            new Error(
              'Async SSR Manager: Can not call `scheduleRerender` outside of `renderUntilCompleted`.',
            ),
          );
        });
      });

      describe('when the given render function throws an error', () => {
        it('rejects with the error', async () => {
          const asyncSsrManager = asyncSsrManagerBinder('test').featureService;
          const mockError = new Error('Failed to render.');

          const mockRender = jest.fn(() => {
            throw mockError;
          });

          return expect(
            asyncSsrManager.renderUntilCompleted(mockRender),
          ).rejects.toEqual(mockError);
        });
      });

      describe('when rendering takes longer than the configured timeout', () => {
        it('rejects with an error after the configured timeout', async () => {
          const asyncSsrManager = asyncSsrManagerBinder('test').featureService;

          const mockRender = jest.fn(() => {
            asyncSsrManager.scheduleRerender(
              new Promise<never>(() => undefined),
            );

            return 'testHtml';
          });

          return expect(
            useFakeTimers(
              async () => asyncSsrManager.renderUntilCompleted(mockRender),
              5,
            ),
          ).rejects.toEqual(new Error('Got rendering timeout after 5 ms.'));
        });
      });

      describe('when no timeout is configured', () => {
        beforeEach(() => {
          asyncSsrManagerDefinition = defineAsyncSsrManager();

          asyncSsrManagerBinder =
            asyncSsrManagerDefinition.create(mockEnv)!['1.0.0'];
        });

        it('logs a warning', async () => {
          const asyncSsrManager = asyncSsrManagerBinder('test').featureService;
          const mockRender = jest.fn(() => 'testHtml');

          await useFakeTimers(async () =>
            asyncSsrManager.renderUntilCompleted(mockRender),
          );

          expect(stubbedLogger.warn.mock.calls).toEqual([
            [
              'No timeout is configured for the Async SSR Manager. This could lead to unexpectedly long render times or, in the worst case, never resolving render calls!',
            ],
          ]);
        });
      });
    });

    describe('when no Logger Feature Service is provided', () => {
      let consoleWarnSpy: jest.SpyInstance;

      beforeEach(() => {
        consoleWarnSpy = jest.spyOn(console, 'warn');

        asyncSsrManagerDefinition = defineAsyncSsrManager();

        asyncSsrManagerBinder = asyncSsrManagerDefinition.create({
          featureServices: {},
        })!['1.0.0'];
      });

      afterEach(() => {
        consoleWarnSpy.mockRestore();
      });

      it('logs messages using the console', async () => {
        const asyncSsrManager = asyncSsrManagerBinder('test').featureService;
        const mockRender = jest.fn(() => 'testHtml');

        await useFakeTimers(async () =>
          asyncSsrManager.renderUntilCompleted(mockRender),
        );

        expect(consoleWarnSpy.mock.calls).toEqual([
          [
            'No timeout is configured for the Async SSR Manager. This could lead to unexpectedly long render times or, in the worst case, never resolving render calls!',
          ],
        ]);
      });
    });
  });
});
