// tslint:disable:no-implicit-dependencies

import {FeatureHubOptions, createFeatureHub} from '../create-feature-hub';
import {FeatureAppDefinition, FeatureAppManager} from '../feature-app-manager';
import {
  FeatureServiceProviderDefinition,
  FeatureServiceRegistry,
  SharedFeatureService,
} from '../feature-service-registry';
import {logger} from './logger';

describe('createFeatureHub()', () => {
  let featureHubOptions: FeatureHubOptions;

  beforeEach(() => {
    featureHubOptions = {logger};
  });

  describe('without any options', () => {
    it('creates a Feature Hub that contains a Feature App manager', () => {
      const {featureAppManager} = createFeatureHub('test:integrator');

      expect(featureAppManager).toBeInstanceOf(FeatureAppManager);
    });

    it('creates a Feature Hub that contains a Feature Service registry', () => {
      const {featureServiceRegistry} = createFeatureHub('test:integrator');

      expect(featureServiceRegistry).toBeInstanceOf(FeatureServiceRegistry);
    });

    it('creates a Feature Hub that contains an empty set of Feature Services', () => {
      const {featureServices} = createFeatureHub('test:integrator');

      expect(featureServices).toEqual({});
    });
  });

  describe('featureAppManager#getAsyncFeatureAppDefinition', () => {
    describe('without a module loader', () => {
      it('throws an error', () => {
        const {featureAppManager} = createFeatureHub('test:integrator');

        expect(() =>
          featureAppManager.getAsyncFeatureAppDefinition(
            'http://example.com/test.js'
          )
        ).toThrowError(new Error('No module loader provided.'));
      });
    });

    describe('with a module loader', () => {
      let mockModuleLoader: jest.Mock;

      beforeEach(() => {
        mockModuleLoader = jest.fn(async () => Promise.resolve());

        featureHubOptions = {
          ...featureHubOptions,
          moduleLoader: mockModuleLoader,
        };
      });

      it('uses the module loader to load the Feature App definition', () => {
        const {featureAppManager} = createFeatureHub(
          'test:integrator',
          featureHubOptions
        );

        const url = 'http://example.com/test.js';

        featureAppManager.getAsyncFeatureAppDefinition(url, 'a');

        expect(mockModuleLoader).toHaveBeenCalledWith(url, 'a');
      });
    });
  });

  describe('featureAppManager#createFeatureAppScope', () => {
    let mockFeatureApp: {};
    let mockFeatureAppCreate: jest.Mock;
    let mockFeatureAppDefinition: FeatureAppDefinition<unknown>;

    beforeEach(() => {
      mockFeatureApp = {};
      mockFeatureAppCreate = jest.fn(() => mockFeatureApp);

      mockFeatureAppDefinition = {
        dependencies: {externals: {foo: '^1.0.0'}},
        create: mockFeatureAppCreate,
      };
    });

    it('creates a Feature App', () => {
      const {featureAppManager} = createFeatureHub(
        'test:integrator',
        featureHubOptions
      );

      const {featureApp} = featureAppManager.createFeatureAppScope(
        'test:feature-app',
        mockFeatureAppDefinition
      );

      expect(mockFeatureAppCreate).toHaveBeenCalledWith({
        featureAppId: 'test:feature-app',
        featureServices: {},
      });

      expect(featureApp).toBe(mockFeatureApp);
    });

    describe('with provided externals', () => {
      beforeEach(() => {
        featureHubOptions = {...featureHubOptions, providedExternals: {}};
      });

      it('throws for a Feature App with mismatching externals', () => {
        const {featureAppManager} = createFeatureHub(
          'test:integrator',
          featureHubOptions
        );

        expect(() =>
          featureAppManager.createFeatureAppScope(
            'test:feature-app',
            mockFeatureAppDefinition
          )
        ).toThrowError(
          new Error('The external dependency "foo" is not provided.')
        );
      });
    });

    describe('with an onBind callback', () => {
      it('calls the onBind callback successfully', () => {
        const mockOnBind = jest.fn();
        const featureAppId = 'testId';
        const featureAppName = 'testName';

        const {featureAppManager} = createFeatureHub('test:integrator', {
          ...featureHubOptions,
          onBind: mockOnBind,
        });

        featureAppManager.createFeatureAppScope(
          featureAppId,
          mockFeatureAppDefinition,
          {featureAppName}
        );

        expect(mockOnBind.mock.calls).toEqual([
          [
            {
              featureAppDefinition: mockFeatureAppDefinition,
              featureAppId,
              featureAppName,
            },
          ],
        ]);
      });
    });
  });

  describe('with Feature Service definitions', () => {
    let mockFeatureServiceCreate: jest.Mock;
    let mockFeatureServiceV1Binder: jest.Mock;
    let mockFeatureServiceV1: {};

    beforeEach(() => {
      mockFeatureServiceV1 = {};

      mockFeatureServiceV1Binder = jest.fn(() => ({
        featureService: mockFeatureServiceV1,
      }));

      mockFeatureServiceCreate = jest.fn(() => ({
        '1.0.0': mockFeatureServiceV1Binder,
      }));

      featureHubOptions = {
        ...featureHubOptions,
        featureServiceDefinitions: [
          {
            id: 'test:feature-service',
            dependencies: {externals: {foo: '^1.0.0'}},
            create: mockFeatureServiceCreate,
          },
        ],
      };
    });

    it('registers and creates the Feature Services', () => {
      createFeatureHub('test:integrator', featureHubOptions);

      expect(mockFeatureServiceCreate).toHaveBeenCalledWith({
        featureServices: {},
      });
    });

    describe('and with provided externals', () => {
      beforeEach(() => {
        featureHubOptions = {...featureHubOptions, providedExternals: {}};
      });

      it('throws for a Feature Service with mismatching externals', () => {
        expect(() =>
          createFeatureHub('test:integrator', featureHubOptions)
        ).toThrowError(
          new Error('The external dependency "foo" is not provided.')
        );
      });
    });

    describe('and without Feature Service dependencies', () => {
      it('creates a Feature Hub that contains an empty set of Feature Services', () => {
        const {featureServices} = createFeatureHub(
          'test:integrator',
          featureHubOptions
        );

        expect(featureServices).toEqual({});
      });
    });

    describe('and with Feature Service dependencies', () => {
      beforeEach(() => {
        featureHubOptions = {
          ...featureHubOptions,
          featureServiceDependencies: {'test:feature-service': '^1.0.0'},
        };
      });

      it('creates a Feature Hub that contains Feature Services that are bound to the integrator', () => {
        const {featureServices} = createFeatureHub(
          'test:integrator',
          featureHubOptions
        );

        expect(mockFeatureServiceV1Binder.mock.calls).toEqual([
          ['test:integrator', undefined],
        ]);

        expect(featureServices['test:feature-service']).toBe(
          mockFeatureServiceV1
        );
      });
    });
  });

  describe('logging', () => {
    let featureAppDefinition: FeatureAppDefinition<unknown>;

    let featureServiceDefinitions: FeatureServiceProviderDefinition<
      SharedFeatureService
    >[];

    let expectedLogCalls: string[][];

    beforeEach(() => {
      featureAppDefinition = {create: jest.fn(() => ({}))};

      featureServiceDefinitions = [
        {id: 'test:feature-service', create: () => ({'1.0.0': jest.fn()})},
      ];

      expectedLogCalls = [
        [
          'The Feature Service "test:feature-service" has been successfully registered by registrant "test:integrator".',
        ],
        [
          'The Feature App with the ID "test:feature-app" has been successfully created.',
        ],
      ];
    });

    describe('with a custom logger', () => {
      it('logs messages using the custom logger', () => {
        const {featureAppManager} = createFeatureHub('test:integrator', {
          featureServiceDefinitions,
          logger,
        });

        featureAppManager.createFeatureAppScope(
          'test:feature-app',
          featureAppDefinition
        );

        expect(logger.info.mock.calls).toEqual(expectedLogCalls);
      });
    });

    describe('without a custom logger', () => {
      let consoleInfoSpy: jest.SpyInstance;

      beforeEach(() => {
        consoleInfoSpy = jest.spyOn(console, 'info');
      });

      afterEach(() => {
        consoleInfoSpy.mockRestore();
      });

      it('logs messages using the console', () => {
        const {featureAppManager} = createFeatureHub('test:integrator', {
          featureServiceDefinitions,
        });

        featureAppManager.createFeatureAppScope(
          'test:feature-app',
          featureAppDefinition
        );

        expect(consoleInfoSpy.mock.calls).toEqual(expectedLogCalls);
      });
    });
  });
});
