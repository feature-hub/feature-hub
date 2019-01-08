import {
  FeatureAppEnvironment,
  FeatureServiceBinder,
  FeatureServiceProviderDefinition
} from '@feature-hub/core';
import {ServerRendererV1, ServerRequest, defineServerRenderer} from '..';
import {useFakeTimers} from './use-fake-timers';

describe('defineServerRenderer', () => {
  let mockEnv: FeatureAppEnvironment<undefined, {}>;
  let serverRendererDefinition: FeatureServiceProviderDefinition;
  let serverRequest: ServerRequest;

  beforeEach(() => {
    jest.useFakeTimers();

    mockEnv = {config: undefined, featureServices: {}, idSpecifier: undefined};

    serverRequest = {
      path: '/app',
      cookies: {},
      headers: {}
    };

    serverRendererDefinition = defineServerRenderer(serverRequest);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('creates a server renderer definition', () => {
    expect(serverRendererDefinition.id).toBe('s2:server-renderer');
    expect(serverRendererDefinition.dependencies).toBeUndefined();
  });

  describe('#create', () => {
    it('creates a shared Feature Service containing version 1.0', () => {
      const sharedServerRenderer = serverRendererDefinition.create(mockEnv);

      expect(sharedServerRenderer['1.0']).toBeDefined();
    });

    for (const invalidConfig of [null, {rerenderWait: false}]) {
      describe(`with an invalid config ${JSON.stringify(
        invalidConfig
      )}`, () => {
        it('throws an error', () => {
          expect(() =>
            serverRendererDefinition.create({
              featureServices: {},
              config: invalidConfig
            })
          ).toThrowError(new Error('The ServerRenderer config is invalid.'));
        });
      });
    }
  });

  describe('ServerRendererV1', () => {
    let serverRendererBinder: FeatureServiceBinder<ServerRendererV1>;

    beforeEach(() => {
      serverRendererBinder = serverRendererDefinition.create(mockEnv)[
        '1.0'
      ] as FeatureServiceBinder<ServerRendererV1>;
    });

    it('exposes a serverRequest', () => {
      const serverRenderer = serverRendererBinder('test:1').featureService;

      expect(serverRenderer.serverRequest).toEqual(serverRequest);
    });

    describe('rendering', () => {
      const createServerRendererConsumer = (
        consumerUid: string,
        rerenderWait = 0
      ) => {
        const serverRenderer = serverRendererBinder(consumerUid).featureService;

        let firstRender = true;
        let completed = false;

        const render = () => {
          if (firstRender) {
            firstRender = false;
            serverRenderer.register(() => completed);

            setTimeout(async () => {
              completed = true;

              await serverRenderer.rerender();
            }, rerenderWait);
          }
        };

        return {render};
      };

      describe('with an integrator as the only consumer', () => {
        it('resolves with the result of the given render function after the first render pass', async () => {
          const serverRenderer = serverRendererBinder('test').featureService;
          const mockRender = jest.fn(() => 'testHtml');
          const html = await serverRenderer.renderUntilCompleted(mockRender);

          expect(html).toEqual('testHtml');
          expect(mockRender).toHaveBeenCalledTimes(1);
        });
      });

      describe('with an integrator, and a consumer that is completed in the first render pass', () => {
        it('resolves with an html string after the first render pass', async () => {
          const serverRendererIntegrator = serverRendererBinder(
            'test:integrator'
          ).featureService;

          const serverRendererConsumer = serverRendererBinder('test:consumer')
            .featureService;

          const mockRender = jest.fn(() => {
            serverRendererConsumer.register(() => true);

            return 'testHtml';
          });

          const html = await useFakeTimers(async () =>
            serverRendererIntegrator.renderUntilCompleted(mockRender)
          );

          expect(html).toEqual('testHtml');
          expect(mockRender).toHaveBeenCalledTimes(1);
        });
      });

      describe('with an integrator, and a consumer that is completed after triggering a rerender', () => {
        it('resolves with an html string after the second render pass', async () => {
          const serverRendererIntegrator = serverRendererBinder(
            'test:integrator'
          ).featureService;

          const serverRendererConsumer = createServerRendererConsumer(
            'test:consumer'
          );

          const mockRender = jest.fn(() => {
            serverRendererConsumer.render();

            return 'testHtml';
          });

          const html = await useFakeTimers(async () =>
            serverRendererIntegrator.renderUntilCompleted(mockRender)
          );

          expect(html).toEqual('testHtml');
          expect(mockRender).toHaveBeenCalledTimes(2);
        });
      });

      describe('with an integrator, and two consumers that are completed after both triggered a rerender within "rerenderWait" milliseconds', () => {
        it('resolves with an html string after the second render pass', async () => {
          const serverRendererIntegrator = serverRendererBinder(
            'test:integrator'
          ).featureService;

          const serverRendererConsumer1 = createServerRendererConsumer(
            'test:consumer:1',
            50
          );

          const serverRendererConsumer2 = createServerRendererConsumer(
            'test:consumer:2',
            100
          );

          const mockRender = jest.fn(() => {
            serverRendererConsumer1.render();
            serverRendererConsumer2.render();

            return 'testHtml';
          });

          const html = await useFakeTimers(
            async () =>
              serverRendererIntegrator.renderUntilCompleted(mockRender),
            150
          );

          expect(html).toEqual('testHtml');
          expect(mockRender).toHaveBeenCalledTimes(2);
        });
      });

      describe('with an integrator, and two consumers that are completed after triggering a rerender more than "rerenderWait" milliseconds apart from one another', () => {
        describe('and the default "rerenderWait"', () => {
          it('resolves with an html string after the third render pass', async () => {
            const serverRendererIntegrator = serverRendererBinder(
              'test:integrator'
            ).featureService;

            const serverRendererConsumer1 = createServerRendererConsumer(
              'test:consumer:1',
              50
            );

            const serverRendererConsumer2 = createServerRendererConsumer(
              'test:consumer:2',
              101
            );

            const mockRender = jest.fn(() => {
              serverRendererConsumer1.render();
              serverRendererConsumer2.render();

              return 'testHtml';
            });

            const html = await useFakeTimers(
              async () =>
                serverRendererIntegrator.renderUntilCompleted(mockRender),
              151
            );

            expect(html).toEqual('testHtml');
            expect(mockRender).toHaveBeenCalledTimes(3);
          });
        });

        describe('and a custom, higher rerenderWait', () => {
          beforeEach(() => {
            serverRendererBinder = serverRendererDefinition.create({
              config: {rerenderWait: 51},
              featureServices: {}
            })['1.0'] as FeatureServiceBinder<ServerRendererV1>;
          });

          it('resolves with an html string after the second render pass', async () => {
            const serverRendererIntegrator = serverRendererBinder(
              'test:integrator'
            ).featureService;

            const serverRendererConsumer1 = createServerRendererConsumer(
              'test:consumer:1',
              50
            );

            const serverRendererConsumer2 = createServerRendererConsumer(
              'test:consumer:2',
              101
            );

            const mockRender = jest.fn(() => {
              serverRendererConsumer1.render();
              serverRendererConsumer2.render();

              return 'testHtml';
            });

            const html = await useFakeTimers(
              async () =>
                serverRendererIntegrator.renderUntilCompleted(mockRender),
              152
            );

            expect(html).toEqual('testHtml');
            expect(mockRender).toHaveBeenCalledTimes(2);
          });
        });
      });

      describe('when the given render function throws an error', () => {
        it('rejects with the error', async () => {
          const serverRenderer = serverRendererBinder('test').featureService;
          const mockError = new Error('Failed to render.');

          const mockRender = jest.fn(() => {
            throw mockError;
          });

          return expect(
            serverRenderer.renderUntilCompleted(mockRender)
          ).rejects.toEqual(mockError);
        });
      });

      describe('when renderUntilCompleted is called multiple times', () => {
        it('rejects with an error', async () => {
          const serverRenderer = serverRendererBinder('test').featureService;
          const mockRender = jest.fn(() => 'testHtml');

          await serverRenderer.renderUntilCompleted(mockRender);

          return expect(
            serverRenderer.renderUntilCompleted(mockRender)
          ).rejects.toEqual(new Error('Rendering has already been started.'));
        });
      });
    });
  });
});
