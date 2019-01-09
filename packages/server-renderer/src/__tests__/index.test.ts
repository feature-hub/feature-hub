// tslint:disable:no-implicit-dependencies

import {
  FeatureAppEnvironment,
  FeatureServiceBinder,
  FeatureServiceProviderDefinition
} from '@feature-hub/core';
import mockConsole from 'jest-mock-console';
import {ServerRendererV1, ServerRequest, defineServerRenderer} from '..';
import {ServerRendererConfig} from '../config';
import {useFakeTimers} from './use-fake-timers';

describe('defineServerRenderer', () => {
  let mockEnv: FeatureAppEnvironment<ServerRendererConfig, {}>;
  let serverRendererDefinition: FeatureServiceProviderDefinition;
  let serverRequest: ServerRequest;

  beforeEach(() => {
    mockEnv = {
      config: {timeout: 5},
      featureServices: {},
      idSpecifier: undefined
    };

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

    for (const invalidConfig of [null, {timeout: false}]) {
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
      const createServerRendererConsumer = (consumerUid: string) => {
        const serverRenderer = serverRendererBinder(consumerUid).featureService;

        let firstRender = true;

        const render = () => {
          if (firstRender) {
            firstRender = false;
            serverRenderer.rerenderAfter(Promise.resolve());
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

      describe('with an integrator, and a consumer that triggers a rerender', () => {
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

          const html = await serverRendererIntegrator.renderUntilCompleted(
            mockRender
          );

          expect(html).toEqual('testHtml');
          expect(mockRender).toHaveBeenCalledTimes(2);
        });
      });

      describe('with an integrator, and two consumers that both trigger a rerender in the first render pass', () => {
        it('resolves with an html string after the second render pass', async () => {
          const serverRendererIntegrator = serverRendererBinder(
            'test:integrator'
          ).featureService;

          const serverRendererConsumer1 = createServerRendererConsumer(
            'test:consumer:1'
          );

          const serverRendererConsumer2 = createServerRendererConsumer(
            'test:consumer:2'
          );

          const mockRender = jest.fn(() => {
            serverRendererConsumer1.render();
            serverRendererConsumer2.render();

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

      describe('when rendering takes longer than the configured timeout', () => {
        it('rejects with an error after the configured timeout', async () => {
          const serverRenderer = serverRendererBinder('test').featureService;
          const mockRender = jest.fn(() => {
            serverRenderer.rerenderAfter(new Promise<void>(() => undefined));

            return 'testHtml';
          });

          return expect(
            useFakeTimers(
              async () => serverRenderer.renderUntilCompleted(mockRender),
              5
            )
          ).rejects.toEqual(new Error('Got rendering timeout after 5 ms.'));
        });
      });

      describe('when no timeout is configured', () => {
        beforeEach(() => {
          serverRendererBinder = serverRendererDefinition.create({
            config: undefined,
            featureServices: {}
          })['1.0'] as FeatureServiceBinder<ServerRendererV1>;
        });

        it('logs a warning', async () => {
          const serverRenderer = serverRendererBinder('test').featureService;
          const mockRender = jest.fn(() => 'testHtml');
          const restoreConsole = mockConsole();

          await useFakeTimers(async () =>
            serverRenderer.renderUntilCompleted(mockRender)
          );

          expect(console.warn).toHaveBeenCalledWith(
            'No timeout is configured for the server renderer. This could lead to unexpectedly long render times or, in the worst case, never resolving render calls!'
          );

          restoreConsole();
        });
      });
    });
  });
});
