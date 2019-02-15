import {
  FeatureServiceBinder,
  FeatureServiceEnvironment,
  FeatureServiceProviderDefinition
} from '@feature-hub/core';
import {ServerRequestV0, SharedServerRequest, defineServerRequest} from '..';

describe('defineServerRequest', () => {
  let mockEnv: FeatureServiceEnvironment<undefined, {}>;
  let serverRequestDefinition: FeatureServiceProviderDefinition<
    SharedServerRequest
  >;
  let serverRequest: ServerRequestV0;

  beforeEach(() => {
    mockEnv = {config: undefined, featureServices: {}};

    serverRequest = {
      url: '/app',
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

      expect(sharedServerRequest['1.0.0']).toBeDefined();
    });
  });

  describe('ServerRequestV0', () => {
    let serverRequestBinder: FeatureServiceBinder<ServerRequestV0>;

    beforeEach(() => {
      serverRequestBinder = serverRequestDefinition.create(mockEnv)['1.0.0'];
    });

    it('equals the defined serverRequest', () => {
      const {featureService} = serverRequestBinder('test:1');

      expect(featureService).toEqual(serverRequest);
    });
  });
});
