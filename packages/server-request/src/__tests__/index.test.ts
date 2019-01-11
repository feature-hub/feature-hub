import {
  FeatureServiceBinder,
  FeatureServiceEnvironment,
  FeatureServiceProviderDefinition
} from '@feature-hub/core';
import {ServerRequestV0, defineServerRequest} from '..';

describe('defineServerRequest', () => {
  let mockEnv: FeatureServiceEnvironment<undefined, {}>;
  let serverRequestDefinition: FeatureServiceProviderDefinition;
  let serverRequest: ServerRequestV0;

  beforeEach(() => {
    mockEnv = {config: undefined, featureServices: {}};

    serverRequest = {
      path: '/app',
      cookies: {},
      headers: {}
    };

    serverRequestDefinition = defineServerRequest(serverRequest);
  });

  it('creates a Server Request definition', () => {
    expect(serverRequestDefinition.id).toBe('s2:server-request');
    expect(serverRequestDefinition.dependencies).toBeUndefined();
  });

  describe('#create', () => {
    it('creates a shared Feature Service containing version 0.1', () => {
      const sharedServerRequest = serverRequestDefinition.create(mockEnv);

      expect(sharedServerRequest['0.1']).toBeDefined();
    });
  });

  describe('ServerRequestV0', () => {
    let serverRequestBinder: FeatureServiceBinder<ServerRequestV0>;

    beforeEach(() => {
      serverRequestBinder = serverRequestDefinition.create(mockEnv)[
        '0.1'
      ] as FeatureServiceBinder<ServerRequestV0>;
    });

    it('equals the defined serverRequest', () => {
      const {featureService} = serverRequestBinder('test:1');

      expect(featureService).toEqual(serverRequest);
    });
  });
});
