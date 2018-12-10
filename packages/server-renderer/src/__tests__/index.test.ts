import {
  FeatureAppEnvironment,
  FeatureServiceBinder,
  FeatureServiceProviderDefinition
} from '@feature-hub/core';
import {ServerRendererV1, defineServerRenderer} from '..';

describe('defineServerRenderer', () => {
  let mockEnv: FeatureAppEnvironment<undefined, {}>;
  let serverRendererDefinition: FeatureServiceProviderDefinition;

  beforeEach(() => {
    mockEnv = {config: undefined, requiredFeatureServices: {}};

    const serverRequest = {
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
    it('creates a shared feature service containing version 1.0', () => {
      const sharedServerRenderer = serverRendererDefinition.create(mockEnv);

      expect(sharedServerRenderer['1.0']).toBeDefined();
    });
  });

  describe('ServerRendererV1', () => {
    it('exposes a serverRequest', () => {
      const serverRequest = {
        path: '/app',
        cookies: {
          hallo: 'world'
        },
        headers: {
          'content-type': 'application/json'
        }
      };

      serverRendererDefinition = defineServerRenderer(serverRequest);

      const serverRendererBinder = serverRendererDefinition.create(mockEnv)[
        '1.0'
      ] as FeatureServiceBinder<ServerRendererV1>;

      expect(
        serverRendererBinder('test:1').featureService.serverRequest
      ).toEqual(serverRequest);
    });
  });
});
