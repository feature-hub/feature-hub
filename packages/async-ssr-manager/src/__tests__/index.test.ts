// tslint:disable:no-implicit-dependencies

import {FeatureAppEnvironment, FeatureServiceBinder} from '@feature-hub/core';
import {stubMethods} from 'jest-stub-methods';
import {
  AsyncSsrManagerConfig,
  AsyncSsrManagerV0,
  asyncSsrManagerDefinition
} from '..';
import {useFakeTimers} from './use-fake-timers';

async function simulateAsyncOperation(result: number): Promise<number> {
  return new Promise<number>(
    // schedule new macro task
    resolve => setImmediate(() => resolve(result))
  );
}

describe('asyncSsrManagerDefinition', () => {
  let mockEnv: FeatureAppEnvironment<AsyncSsrManagerConfig, {}>;

  beforeEach(() => {
    mockEnv = {
      config: {timeout: 5},
      featureServices: {},
      idSpecifier: undefined
    };
  });

  it('defines an id', () => {
    expect(asyncSsrManagerDefinition.id).toBe('s2:async-ssr-manager');
  });

  it('has no dependencies', () => {
    expect(asyncSsrManagerDefinition.dependencies).toBeUndefined();
    expect(asyncSsrManagerDefinition.optionalDependencies).toBeUndefined();
  });

  describe('#create', () => {
    it('creates a shared Feature Service containing version 0.1.0', () => {
      const sharedAsyncSsrManager = asyncSsrManagerDefinition.create(mockEnv);

      expect(sharedAsyncSsrManager['0.1.0']).toBeDefined();
    });

    for (const invalidConfig of [null, {timeout: false}]) {
      describe(`with an invalid config ${JSON.stringify(
        invalidConfig
      )}`, () => {
        it('throws an error', () => {
          expect(() =>
            asyncSsrManagerDefinition.create({
              featureServices: {},
              config: invalidConfig
            })
          ).toThrowError(new Error('The Async SSR Manager config is invalid.'));
        });
      });
    }
  });

  describe('AsyncSsrManagerV0', () => {
    let asyncSsrManagerBinder: FeatureServiceBinder<AsyncSsrManagerV0>;

    beforeEach(() => {
      asyncSsrManagerBinder = asyncSsrManagerDefinition.create(mockEnv)[
        '0.1.0'
      ];
    });

    describe('rendering', () => {
      describe('with an integrator as the only consumer', () => {
        it('resolves with the result of the given render function after the first render pass', async () => {
          const asyncSsrManager = asyncSsrManagerBinder('test').featureService;
          const mockRender = jest.fn(() => 'testHtml');

          const html = await useFakeTimers(async () =>
            asyncSsrManager.renderUntilCompleted(mockRender)
          );

          expect(html).toEqual('testHtml');
          expect(mockRender).toHaveBeenCalledTimes(1);
        });
      });

      describe('with an integrator, and a consumer that schedules a rerender with a custom promise', () => {
        it('resolves with an html string after the second render pass', async () => {
          const asyncSsrManagerIntegrator = asyncSsrManagerBinder(
            'test:integrator'
          ).featureService;

          const asyncSsrManagerConsumer = asyncSsrManagerBinder('test:consumer')
            .featureService;

          let renderPass = 0;

          const mockRender = jest.fn(() => {
            renderPass += 1;

            if (renderPass === 1) {
              asyncSsrManagerConsumer.scheduleRerender(Promise.resolve());
            }

            return `render pass ${renderPass}`;
          });

          const html = await useFakeTimers(async () =>
            asyncSsrManagerIntegrator.renderUntilCompleted(mockRender)
          );

          expect(html).toEqual('render pass 2');
          expect(mockRender).toHaveBeenCalledTimes(2);
        });
      });

      describe('with an integrator, and a consumer that schedules a rerender without a custom promise', () => {
        it('resolves with an html string after the second render pass', async () => {
          const asyncSsrManagerIntegrator = asyncSsrManagerBinder(
            'test:integrator'
          ).featureService;

          const asyncSsrManagerConsumer = asyncSsrManagerBinder('test:consumer')
            .featureService;

          let renderPass = 0;

          const mockRender = jest.fn(() => {
            renderPass += 1;

            if (renderPass === 1) {
              asyncSsrManagerConsumer.scheduleRerender();
            }

            return `render pass ${renderPass}`;
          });

          const html = await useFakeTimers(async () =>
            asyncSsrManagerIntegrator.renderUntilCompleted(mockRender)
          );

          expect(html).toEqual('render pass 2');
          expect(mockRender).toHaveBeenCalledTimes(2);
        });
      });

      describe('with an integrator, and a consumer that schedules a rerender in two consecutive render passes', () => {
        it('resolves with an html string after the third render pass', async () => {
          const asyncSsrManagerIntegrator = asyncSsrManagerBinder(
            'test:integrator'
          ).featureService;

          const asyncSsrManagerConsumer = asyncSsrManagerBinder('test:consumer')
            .featureService;

          let renderPass = 0;

          const mockRender = jest.fn(() => {
            renderPass += 1;

            if (renderPass < 3) {
              asyncSsrManagerConsumer.scheduleRerender();
            }

            return `render pass ${renderPass}`;
          });

          const html = await useFakeTimers(async () =>
            asyncSsrManagerIntegrator.renderUntilCompleted(mockRender)
          );

          expect(html).toEqual('render pass 3');
          expect(mockRender).toHaveBeenCalledTimes(3);
        });
      });

      describe('with an integrator, and a consumer that first schedules a rerender with a custom promise, awaits the promise, and then schedules a rerender with another promise', () => {
        it('resolves with an html string after the second render pass', async done => {
          const asyncSsrManagerIntegrator = asyncSsrManagerBinder(
            'test:integrator'
          ).featureService;

          const asyncSsrManagerConsumer = asyncSsrManagerBinder('test:consumer')
            .featureService;

          let renderPass = 0;
          let consumerResult = 0;

          const mockRender = jest.fn(() => {
            renderPass += 1;

            if (renderPass === 1) {
              (async () => {
                const promise1 = simulateAsyncOperation(1);
                asyncSsrManagerConsumer.scheduleRerender(promise1);
                consumerResult = await promise1;

                const promise2 = simulateAsyncOperation(2);
                asyncSsrManagerConsumer.scheduleRerender(promise2);
                consumerResult = await promise2;
              })().catch(done.fail);
            }

            return `render pass ${renderPass}, consumer result ${consumerResult}`;
          });

          const html = await useFakeTimers(async () =>
            asyncSsrManagerIntegrator.renderUntilCompleted(mockRender)
          );

          expect(html).toEqual('render pass 2, consumer result 2');
          expect(mockRender).toHaveBeenCalledTimes(2);

          done();
        });
      });

      describe('with an integrator, and two consumers that both schedule a rerender in the first render pass', () => {
        it('resolves with an html string after the second render pass', async () => {
          const asyncSsrManagerIntegrator = asyncSsrManagerBinder(
            'test:integrator'
          ).featureService;

          const asyncSsrManagerConsumer1 = asyncSsrManagerBinder(
            'test:consumer:1'
          ).featureService;

          const asyncSsrManagerConsumer2 = asyncSsrManagerBinder(
            'test:consumer:2'
          ).featureService;

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
            asyncSsrManagerIntegrator.renderUntilCompleted(mockRender)
          );

          expect(html).toEqual('render pass 2');
          expect(mockRender).toHaveBeenCalledTimes(2);
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
            asyncSsrManager.renderUntilCompleted(mockRender)
          ).rejects.toEqual(mockError);
        });
      });

      describe('when rendering takes longer than the configured timeout', () => {
        it('rejects with an error after the configured timeout', async () => {
          const asyncSsrManager = asyncSsrManagerBinder('test').featureService;
          const mockRender = jest.fn(() => {
            asyncSsrManager.scheduleRerender(
              new Promise<never>(() => undefined)
            );

            return 'testHtml';
          });

          return expect(
            useFakeTimers(
              async () => asyncSsrManager.renderUntilCompleted(mockRender),
              5
            )
          ).rejects.toEqual(new Error('Got rendering timeout after 5 ms.'));
        });
      });

      describe('when no timeout is configured', () => {
        beforeEach(() => {
          asyncSsrManagerBinder = asyncSsrManagerDefinition.create({
            config: undefined,
            featureServices: {}
          })['0.1.0'];
        });

        it('logs a warning', async () => {
          const asyncSsrManager = asyncSsrManagerBinder('test').featureService;
          const mockRender = jest.fn(() => 'testHtml');
          const stubbedConsole = stubMethods(console);

          await useFakeTimers(async () =>
            asyncSsrManager.renderUntilCompleted(mockRender)
          );

          expect(console.warn).toHaveBeenCalledWith(
            'No timeout is configured for the Async SSR Manager. This could lead to unexpectedly long render times or, in the worst case, never resolving render calls!'
          );

          stubbedConsole.restore();
        });
      });
    });
  });
});
