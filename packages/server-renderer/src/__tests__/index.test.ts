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
        it('resolves with the result of the given render function, in 1 render pass', async () => {
          const serverRenderer = serverRendererBinder('test').featureService;
          const mockRender = jest.fn(() => 'testHtml');
          const html = await serverRenderer.startRendering(mockRender);

          expect(html).toEqual('testHtml');
          expect(mockRender).toHaveBeenCalledTimes(1);
        });
      });

      describe('with an integrator, and a feature app that is completed in the first render pass, as consumers', () => {
        it('resolves with an html string, in 1 render pass', async () => {
          const serverRendererIntegrator = serverRendererBinder(
            'test:integrator'
          ).featureService;

          const serverRendererFeatureApp = serverRendererBinder(
            'test:feature-app'
          ).featureService;

          const mockRender = jest.fn(() => {
            serverRendererFeatureApp.register(() => true);

            return 'testHtml';
          });

          const html = await serverRendererIntegrator.startRendering(
            mockRender
          );

          expect(html).toEqual('testHtml');
          expect(mockRender).toHaveBeenCalledTimes(1);
        });
      });

      describe('with an integrator, and a feature app that is completed immediately after being loaded, as consumers', () => {
        it('resolves with an html string, in 2 render passes', async () => {
          const serverRendererIntegrator = serverRendererBinder(
            'test:integrator'
          ).featureService;

          const serverRendererFeatureApp = serverRendererBinder(
            'test:feature-app'
          ).featureService;

          const mockFeatureAppModuleLoadedEvent = Promise.resolve().then(() => {
            serverRendererFeatureApp.register(() => true);
          });

          const mockRender = jest.fn(() => {
            serverRendererIntegrator.waitForFeatureApp(
              'http://example.com/foo.js',
              mockFeatureAppModuleLoadedEvent
            );

            return 'testHtml';
          });

          const htmlPromise = serverRendererIntegrator.startRendering(
            mockRender
          );

          expect(await htmlPromise).toEqual('testHtml');
          expect(mockRender).toHaveBeenCalledTimes(2);
        });
      });

      describe('with an integrator, and a feature app that is completed after triggering a rerender, as consumers', () => {
        it('resolves with an html string, in 3 render passes', async () => {
          const serverRendererIntegrator = serverRendererBinder(
            'test:integrator'
          ).featureService;

          const serverRendererFeatureApp = serverRendererBinder(
            'test:feature-app'
          ).featureService;

          let featureAppCompleted = false;

          const mockIsCompleted = jest.fn(() => {
            setTimeout(() => {
              featureAppCompleted = true;
              serverRendererFeatureApp.rerender();
            }, 0);

            return featureAppCompleted;
          });

          const mockFeatureAppModuleLoadedEvent = Promise.resolve().then(() => {
            serverRendererFeatureApp.register(mockIsCompleted);
          });

          const mockRender = jest.fn(() => {
            serverRendererIntegrator.waitForFeatureApp(
              'http://example.com/foo.js',
              mockFeatureAppModuleLoadedEvent
            );

            return 'testHtml';
          });

          const html = await serverRendererIntegrator.startRendering(
            mockRender
          );

          expect(html).toEqual('testHtml');
          expect(mockRender).toHaveBeenCalledTimes(3);
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
            serverRenderer.startRendering(mockRender)
          ).rejects.toEqual(mockError);
        });
      });
    });
  });
});
