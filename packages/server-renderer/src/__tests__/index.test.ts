import {
  FeatureAppEnvironment,
  FeatureServiceBinder,
  FeatureServiceProviderDefinition
} from '@feature-hub/core';
import {ServerRendererV1, ServerRequest, defineServerRenderer} from '..';

describe('defineServerRenderer', () => {
  let mockEnv: FeatureAppEnvironment<undefined, {}>;
  let serverRendererDefinition: FeatureServiceProviderDefinition;
  let serverRequest: ServerRequest;

  beforeEach(() => {
    mockEnv = {config: undefined, featureServices: {}, idSpecifier: undefined};

    serverRequest = {
      path: '/app',
      cookies: {},
      headers: {}
    };

    serverRendererDefinition = defineServerRenderer(serverRequest);
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

          const html = await serverRendererIntegrator.renderUntilCompleted(
            mockRender
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

          const serverRendererConsumer = serverRendererBinder('test:consumer')
            .featureService;

          let completed = false;

          const mockRender = jest.fn(() => {
            serverRendererConsumer.register(() => completed);

            // tslint:disable-next-line:no-floating-promises
            Promise.resolve().then(async () => {
              completed = true;
              await serverRendererConsumer.rerender();
            });

            return 'testHtml';
          });

          const html = await serverRendererIntegrator.renderUntilCompleted(
            mockRender
          );

          expect(html).toEqual('testHtml');
          expect(mockRender).toHaveBeenCalledTimes(2);
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
