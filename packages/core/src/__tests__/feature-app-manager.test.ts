// tslint:disable:no-implicit-dependencies

import {
  FeatureAppDefinition,
  FeatureAppManager,
  FeatureServiceRegistry,
  FeatureServicesBinding,
  ModuleLoader,
} from '..';
import {ExternalsValidator} from '../externals-validator';
import {FeatureAppModule} from '../internal/is-feature-app-module';
import {logger} from './logger';

interface MockFeatureServiceRegistry extends FeatureServiceRegistry {
  registerFeatureServices: jest.Mock;
  bindFeatureServices: jest.Mock;
}

describe('FeatureAppManager', () => {
  let featureAppManager: FeatureAppManager;
  let mockFeatureServiceRegistry: MockFeatureServiceRegistry;
  let mockFeatureServicesBinding: FeatureServicesBinding;
  let mockExternalsValidator: ExternalsValidator;
  let mockFeatureServicesBindingUnbind: jest.Mock;
  let mockModuleLoader: ModuleLoader;
  let mockFeatureAppDefinition: FeatureAppDefinition<unknown>;
  let mockFeatureAppModule: FeatureAppModule | undefined;
  let mockFeatureAppCreate: jest.Mock;

  beforeEach(() => {
    mockFeatureServicesBindingUnbind = jest.fn();

    mockFeatureServicesBinding = {
      featureServices: {foo: {}},
      unbind: mockFeatureServicesBindingUnbind,
    };

    mockFeatureServiceRegistry = {
      registerFeatureServices: jest.fn(),
      bindFeatureServices: jest.fn(() => mockFeatureServicesBinding),
    } as MockFeatureServiceRegistry;

    mockFeatureAppCreate = jest.fn(() => ({}));
    mockFeatureAppDefinition = {create: mockFeatureAppCreate};
    mockFeatureAppModule = {default: mockFeatureAppDefinition};
    mockModuleLoader = jest.fn(async () => mockFeatureAppModule);
    mockExternalsValidator = ({validate: jest.fn()} as Partial<
      ExternalsValidator
    >) as ExternalsValidator;

    featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
      logger,
    });
  });

  describe('#getAsyncFeatureAppDefinition', () => {
    beforeEach(() => {
      featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
        logger,
        moduleLoader: mockModuleLoader,
      });
    });

    it('logs an info message when the Feature App module was loaded', async () => {
      const asyncFeatureAppDefinition = featureAppManager.getAsyncFeatureAppDefinition(
        '/example.js'
      );

      expect(logger.info.mock.calls).toEqual([]);

      await asyncFeatureAppDefinition.promise;

      expect(logger.info.mock.calls).toEqual([
        [
          'The Feature App module at the url "/example.js" has been successfully loaded.',
        ],
      ]);
    });

    it('returns an async value for a Feature App definition', async () => {
      const asyncFeatureAppDefinition = featureAppManager.getAsyncFeatureAppDefinition(
        '/example.js'
      );

      expect(asyncFeatureAppDefinition.value).toBeUndefined();
      expect(asyncFeatureAppDefinition.error).toBeUndefined();

      const featureAppDefinition = await asyncFeatureAppDefinition.promise;

      expect(asyncFeatureAppDefinition.value).toBe(featureAppDefinition);
      expect(asyncFeatureAppDefinition.error).toBeUndefined();
      expect(featureAppDefinition).toBe(mockFeatureAppDefinition);
    });

    describe('with a custom module loader that handles multiple module types', () => {
      let mockFeatureAppDefinitionA: FeatureAppDefinition<unknown>;
      let mockFeatureAppDefinitionB: FeatureAppDefinition<unknown>;
      let mockFeatureAppModuleA: FeatureAppModule | undefined;
      let mockFeatureAppModuleB: FeatureAppModule | undefined;

      beforeEach(() => {
        mockFeatureAppDefinitionA = {create: mockFeatureAppCreate};
        mockFeatureAppDefinitionB = {create: mockFeatureAppCreate};
        mockFeatureAppModuleA = {default: mockFeatureAppDefinitionA};
        mockFeatureAppModuleB = {default: mockFeatureAppDefinitionB};

        featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
          logger,
          moduleLoader: async (_url, moduleType) =>
            moduleType === 'a'
              ? mockFeatureAppModuleA
              : moduleType === 'b'
              ? mockFeatureAppModuleB
              : undefined,
        });
      });

      it('returns an async value containing the Feature App definition for the correct module type', async () => {
        // Intentionally used for both module types to show that this is handled
        // correctly by the Feature App Manager.
        const url = '/example.js';

        const asyncFeatureAppDefinitionA = featureAppManager.getAsyncFeatureAppDefinition(
          url,
          'a'
        );

        const featureAppDefinitionA = await asyncFeatureAppDefinitionA.promise;

        expect(featureAppDefinitionA).toBe(mockFeatureAppDefinitionA);

        const asyncFeatureAppDefinitionB = featureAppManager.getAsyncFeatureAppDefinition(
          url,
          'b'
        );

        const featureAppDefinitionB = await asyncFeatureAppDefinitionB.promise;

        expect(featureAppDefinitionB).toBe(mockFeatureAppDefinitionB);
      });

      it('returns an async value containing an error for an missing module type', async () => {
        const expectedError = new Error(
          'The Feature App module at the url "/example.js" with no specific module type is invalid. A Feature App module must have a Feature App definition as default export. A Feature App definition is an object with at least a `create` method. Hint: The provided module loader expects an optional second parameter `moduleType`. It might need to be provided for this Feature App.'
        );

        await expect(
          featureAppManager.getAsyncFeatureAppDefinition('/example.js').promise
        ).rejects.toEqual(expectedError);
      });

      it('returns an async value containing an error for an unknown module type', async () => {
        const expectedError = new Error(
          'The Feature App module at the url "/example.js" with the module type "unknown" is invalid. A Feature App module must have a Feature App definition as default export. A Feature App definition is an object with at least a `create` method.'
        );

        await expect(
          featureAppManager.getAsyncFeatureAppDefinition(
            '/example.js',
            'unknown'
          ).promise
        ).rejects.toEqual(expectedError);
      });
    });

    describe.each([
      undefined,
      null,
      {},
      {default: {}},
      {default: {create: 'notAFunction'}},
    ])(
      'when an invalid Feature App module (%o) has been loaded',
      (invalidFeatureAppModule) => {
        beforeEach(() => {
          // tslint:disable-next-line:no-any
          mockFeatureAppModule = invalidFeatureAppModule as any;
        });

        it('throws an error (and stores it on the async value)', async () => {
          const expectedError = new Error(
            'The Feature App module at the url "/example.js" with no specific module type is invalid. A Feature App module must have a Feature App definition as default export. A Feature App definition is an object with at least a `create` method.'
          );

          await expect(
            featureAppManager.getAsyncFeatureAppDefinition('/example.js')
              .promise
          ).rejects.toEqual(expectedError);

          expect(
            featureAppManager.getAsyncFeatureAppDefinition('/example.js').error
          ).toEqual(expectedError);
        });
      }
    );

    it('throws an error if no module loader was provided', () => {
      featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
        logger,
      });

      expect(() =>
        featureAppManager.getAsyncFeatureAppDefinition('/example.js')
      ).toThrowError(new Error('No module loader provided.'));
    });

    describe('for a known Feature App module url', () => {
      it('returns the same async Feature App definition', () => {
        const asyncFeatureAppDefinition = featureAppManager.getAsyncFeatureAppDefinition(
          '/example.js'
        );

        expect(
          featureAppManager.getAsyncFeatureAppDefinition('/example.js')
        ).toBe(asyncFeatureAppDefinition);
      });
    });
  });

  describe('#createFeatureAppScope', () => {
    it('creates a Feature App with a consumer environment using the Feature Service registry', () => {
      const featureAppId = 'testId';
      const config = 'testConfig';
      const baseUrl = '/base';

      featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
        logger,
      });

      featureAppManager.createFeatureAppScope(
        featureAppId,
        mockFeatureAppDefinition,
        {baseUrl, config}
      );

      expect(
        mockFeatureServiceRegistry.bindFeatureServices.mock.calls
      ).toEqual([[mockFeatureAppDefinition, featureAppId, undefined]]);

      const {featureServices} = mockFeatureServicesBinding;

      expect(mockFeatureAppCreate.mock.calls).toEqual([
        [{baseUrl, config, featureServices, featureAppId}],
      ]);
    });

    describe('with a beforeCreate callback', () => {
      it('calls the beforeCreate callback with the same env that is passed to create, prior to calling create', () => {
        const featureAppId = 'testId';

        featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
          logger,
        });

        let beforeCreateCalled = false;

        const mockBeforeCreate = jest.fn(() => {
          beforeCreateCalled = true;
        });

        expect.assertions(2);

        mockFeatureAppCreate.mockImplementation(() => {
          expect(beforeCreateCalled).toBe(true);

          return {};
        });

        featureAppManager.createFeatureAppScope(
          featureAppId,
          mockFeatureAppDefinition,
          {beforeCreate: mockBeforeCreate}
        );

        expect(mockBeforeCreate.mock.calls).toEqual(
          mockFeatureAppCreate.mock.calls
        );
      });

      describe('that throws an error', () => {
        it('throws the same error and unbinds the bound Feature Services', () => {
          const mockError = new Error('mockError');

          expect(() =>
            featureAppManager.createFeatureAppScope(
              'testId',
              mockFeatureAppDefinition,
              {
                beforeCreate: () => {
                  throw mockError;
                },
              }
            )
          ).toThrowError(mockError);

          expect(mockFeatureServicesBindingUnbind).toHaveBeenCalledTimes(1);
        });
      });
    });

    describe('with a done callback', () => {
      it('passes the done callback as part of the env to the Feature App', () => {
        const featureAppId = 'testId';

        featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
          logger,
        });

        const mockDone = jest.fn();

        featureAppManager.createFeatureAppScope(
          featureAppId,
          mockFeatureAppDefinition,
          {done: mockDone}
        );

        const {featureServices} = mockFeatureServicesBinding;

        expect(mockFeatureAppCreate.mock.calls).toEqual([
          [{featureServices, featureAppId, done: mockDone}],
        ]);
      });
    });

    describe('with an onBind callback', () => {
      it('calls the onBind callback successfully', () => {
        const mockOnBind = jest.fn();
        const featureAppId = 'testId';
        const featureAppName = 'testName';

        featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
          logger,
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

      describe('that throws an error', () => {
        it('does not throw but logs the error', () => {
          const mockError = new Error('mockError');

          featureAppManager = new FeatureAppManager(
            mockFeatureServiceRegistry,
            {
              logger,
              onBind: () => {
                throw mockError;
              },
            }
          );

          expect(() =>
            featureAppManager.createFeatureAppScope(
              'testId',
              mockFeatureAppDefinition
            )
          ).not.toThrow();

          expect(logger.error.mock.calls).toEqual([
            ['Failed to execute onBind callback.', mockError],
          ]);
        });
      });
    });

    describe('with a featureAppName', () => {
      it('passes the featureAppName as consumerName to bindFeatureServices', () => {
        const featureAppId = 'testId';
        const featureAppName = 'testName';

        featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
          logger,
        });

        featureAppManager.createFeatureAppScope(
          featureAppId,
          mockFeatureAppDefinition,
          {featureAppName}
        );

        expect(
          mockFeatureServiceRegistry.bindFeatureServices.mock.calls
        ).toEqual([[mockFeatureAppDefinition, featureAppId, featureAppName]]);
      });

      it('creates a Feature App with a consumer environment that includes the featureAppName', () => {
        const featureAppId = 'testId';
        const featureAppName = 'testName';

        featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
          logger,
        });

        featureAppManager.createFeatureAppScope(
          featureAppId,
          mockFeatureAppDefinition,
          {featureAppName}
        );

        const {featureServices} = mockFeatureServicesBinding;

        expect(mockFeatureAppCreate.mock.calls).toEqual([
          [{featureServices, featureAppId, featureAppName}],
        ]);
      });
    });

    describe('without an ExternalsValidator provided to the FeatureAppManager', () => {
      describe('with a Feature App definition that is declaring external dependencies', () => {
        beforeEach(() => {
          mockFeatureAppDefinition = {
            ...mockFeatureAppDefinition,
            dependencies: {
              externals: {
                react: '^16.0.0',
              },
            },
          };
        });

        it("doesn't throw an error", () => {
          expect(() => {
            featureAppManager.createFeatureAppScope(
              'testId',
              mockFeatureAppDefinition
            );
          }).not.toThrowError();
        });
      });
    });

    describe('with an ExternalsValidator provided to the FeatureAppManager', () => {
      beforeEach(() => {
        featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
          externalsValidator: mockExternalsValidator,
          logger,
        });
      });

      describe('with a Feature App definition that is failing the externals validation', () => {
        let mockError: Error;

        beforeEach(() => {
          mockError = new Error('mockError');

          mockExternalsValidator.validate = jest.fn(() => {
            throw mockError;
          });

          mockFeatureAppDefinition = {
            ...mockFeatureAppDefinition,
            dependencies: {
              externals: {
                react: '^16.0.0',
              },
            },
          };
        });

        it('calls the provided ExternalsValidator with the defined externals', () => {
          try {
            featureAppManager.createFeatureAppScope(
              'testId',
              mockFeatureAppDefinition
            );
          } catch {}

          expect(mockExternalsValidator.validate).toHaveBeenCalledWith({
            react: '^16.0.0',
          });
        });

        it('throws the validation error', () => {
          expect(() => {
            featureAppManager.createFeatureAppScope(
              'testId',
              mockFeatureAppDefinition
            );
          }).toThrowError(mockError);
        });
      });

      describe('with a Feature App definition that is not failing the externals validation', () => {
        beforeEach(() => {
          mockFeatureAppDefinition = {
            ...mockFeatureAppDefinition,
            dependencies: {
              externals: {
                react: '^16.0.0',
              },
            },
          };
        });

        it('calls the provided ExternalsValidator with the defined externals', () => {
          featureAppManager.createFeatureAppScope(
            'testId',
            mockFeatureAppDefinition
          );

          expect(mockExternalsValidator.validate).toHaveBeenCalledWith({
            react: '^16.0.0',
          });
        });

        it("doesn't throw an error", () => {
          expect(() => {
            featureAppManager.createFeatureAppScope(
              'testId',
              mockFeatureAppDefinition
            );
          }).not.toThrowError();
        });
      });

      describe('with a Feature App definition that declares no externals', () => {
        it('does not call the provided ExternalsValidator', () => {
          featureAppManager.createFeatureAppScope(
            'testId',
            mockFeatureAppDefinition
          );

          expect(mockExternalsValidator.validate).not.toHaveBeenCalled();
        });

        it("doesn't throw an error", () => {
          expect(() => {
            featureAppManager.createFeatureAppScope(
              'testId',
              mockFeatureAppDefinition
            );
          }).not.toThrowError();
        });
      });
    });

    describe('when bindFeatureServices throws an error', () => {
      let mockError: Error;

      beforeEach(() => {
        mockError = new Error('mockError');

        mockFeatureServiceRegistry.bindFeatureServices.mockImplementation(
          () => {
            throw mockError;
          }
        );
      });

      it('throws the same error', () => {
        expect(() =>
          featureAppManager.createFeatureAppScope(
            'testId',
            mockFeatureAppDefinition
          )
        ).toThrowError(mockError);
      });
    });

    describe("when the FeatureApp's create method throws an error", () => {
      it('throws the same error and unbinds the bound Feature Services', () => {
        const mockError = new Error('mockError');

        mockFeatureAppCreate.mockImplementation(() => {
          throw mockError;
        });

        expect(() =>
          featureAppManager.createFeatureAppScope(
            'testId',
            mockFeatureAppDefinition
          )
        ).toThrowError(mockError);

        expect(mockFeatureServicesBindingUnbind).toHaveBeenCalledTimes(1);
      });
    });

    describe('with a Feature App definition with own Feature Service definitions', () => {
      let featureServiceRegistryMethodCalls: string[];

      beforeEach(() => {
        featureServiceRegistryMethodCalls = [];

        mockFeatureServiceRegistry.registerFeatureServices.mockImplementation(
          () => {
            featureServiceRegistryMethodCalls.push('registerFeatureServices');
          }
        );

        mockFeatureServiceRegistry.bindFeatureServices.mockImplementation(
          () => {
            featureServiceRegistryMethodCalls.push('bindFeatureServices');

            return mockFeatureServicesBinding;
          }
        );

        mockFeatureAppDefinition = {
          ...mockFeatureAppDefinition,
          ownFeatureServiceDefinitions: [
            {id: 'ownFeatureServiceId', create: jest.fn()},
          ],
        };
      });

      it("registers the Feature App's own Feature Services before binding its required Feature Services", () => {
        const featureAppId = 'testId';

        featureAppManager.createFeatureAppScope(
          featureAppId,
          mockFeatureAppDefinition
        );

        expect(
          mockFeatureServiceRegistry.registerFeatureServices.mock.calls
        ).toEqual([
          [mockFeatureAppDefinition.ownFeatureServiceDefinitions, featureAppId],
        ]);

        expect(
          mockFeatureServiceRegistry.bindFeatureServices.mock.calls
        ).toEqual([[mockFeatureAppDefinition, featureAppId, undefined]]);

        expect(featureServiceRegistryMethodCalls).toEqual([
          'registerFeatureServices',
          'bindFeatureServices',
        ]);
      });
    });

    describe('for a known Feature App definition', () => {
      describe('with a beforeCreate callback', () => {
        it('does not call the beforeCreate callback multiple times', () => {
          const featureAppId = 'testId';

          featureAppManager = new FeatureAppManager(
            mockFeatureServiceRegistry,
            {logger}
          );

          const mockBeforeCreate = jest.fn();

          featureAppManager.createFeatureAppScope(
            featureAppId,
            mockFeatureAppDefinition,
            {beforeCreate: mockBeforeCreate}
          );

          featureAppManager.createFeatureAppScope(
            featureAppId,
            mockFeatureAppDefinition,
            {beforeCreate: mockBeforeCreate}
          );

          expect(mockBeforeCreate.mock.calls).toHaveLength(1);

          expect(mockBeforeCreate.mock.calls).toEqual(
            mockFeatureAppCreate.mock.calls
          );
        });

        describe('when release() is called on the Feature App scope', () => {
          it('calls the beforeCreate callback again', () => {
            const featureAppId = 'testId';

            featureAppManager = new FeatureAppManager(
              mockFeatureServiceRegistry,
              {logger}
            );

            const mockBeforeCreate = jest.fn();

            const featureAppScope = featureAppManager.createFeatureAppScope(
              featureAppId,
              mockFeatureAppDefinition,
              {beforeCreate: mockBeforeCreate}
            );

            featureAppScope.release();

            featureAppManager.createFeatureAppScope(
              featureAppId,
              mockFeatureAppDefinition,
              {beforeCreate: mockBeforeCreate}
            );

            expect(mockBeforeCreate.mock.calls).toHaveLength(2);

            expect(mockBeforeCreate.mock.calls).toEqual(
              mockFeatureAppCreate.mock.calls
            );
          });
        });
      });

      it('logs an info message after creation', () => {
        featureAppManager.createFeatureAppScope(
          'testId',
          mockFeatureAppDefinition
        );

        expect(logger.info.mock.calls).toEqual([
          [
            'The Feature App with the ID "testId" has been successfully created.',
          ],
        ]);
      });

      it('returns a new Feature App scope containing the same Feature App instance', () => {
        const featureAppScope1 = featureAppManager.createFeatureAppScope(
          'testId',
          mockFeatureAppDefinition
        );

        const featureAppScope2 = featureAppManager.createFeatureAppScope(
          'testId',
          mockFeatureAppDefinition
        );

        expect(featureAppScope2).not.toBe(featureAppScope1);
        expect(featureAppScope2.featureApp).toBe(featureAppScope1.featureApp);
      });
    });

    describe('#featureApp', () => {
      it("is the Feature App that the Feature App definition's create returns", () => {
        const mockFeatureApp = {};

        mockFeatureAppCreate.mockReturnValue(mockFeatureApp);

        const featureAppScope = featureAppManager.createFeatureAppScope(
          'testId',
          mockFeatureAppDefinition
        );

        expect(featureAppScope.featureApp).toBe(mockFeatureApp);
      });
    });

    describe('#release', () => {
      it('unbinds the bound Feature Services', () => {
        const featureAppScope = featureAppManager.createFeatureAppScope(
          'testId',
          mockFeatureAppDefinition
        );

        featureAppScope.release();

        expect(mockFeatureServicesBindingUnbind).toHaveBeenCalledTimes(1);
      });

      describe('when unbind throws an error', () => {
        it('a consecutive call of createFeatureAppScope does not return a scope with the old Feature App instance', () => {
          const mockError = new Error('failed to unbind');

          const featureAppScope1 = featureAppManager.createFeatureAppScope(
            'testId',
            mockFeatureAppDefinition
          );

          mockFeatureServicesBindingUnbind.mockImplementation(() => {
            throw mockError;
          });

          expect(() => {
            featureAppScope1.release();
          }).toThrowError(mockError);

          const featureAppScope2 = featureAppManager.createFeatureAppScope(
            'testId',
            mockFeatureAppDefinition
          );

          expect(featureAppScope1.featureApp).not.toBe(
            featureAppScope2.featureApp
          );
        });
      });

      describe('when createFeatureAppScope has been called two times', () => {
        it('unbinds the bound Feature Services after the second scope has been released', () => {
          const featureAppScope1 = featureAppManager.createFeatureAppScope(
            'testId',
            mockFeatureAppDefinition
          );

          const featureAppScope2 = featureAppManager.createFeatureAppScope(
            'testId',
            mockFeatureAppDefinition
          );

          featureAppScope1.release();
          expect(mockFeatureServicesBindingUnbind).not.toHaveBeenCalled();

          featureAppScope2.release();
          expect(mockFeatureServicesBindingUnbind).toHaveBeenCalledTimes(1);
        });
      });

      it('logs a warning when release is called multiple times', () => {
        const featureAppScope = featureAppManager.createFeatureAppScope(
          'testId',
          mockFeatureAppDefinition
        );

        featureAppScope.release();
        featureAppScope.release();

        expect(logger.warn.mock.calls).toEqual([
          [
            'The Feature App with the ID "testId" has already been released for this scope.',
          ],
        ]);
      });
    });
  });

  describe('#preloadFeatureApp', () => {
    beforeEach(() => {
      featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
        moduleLoader: mockModuleLoader,
        logger,
      });
    });

    it('preloads a Feature App definition so that the scope is synchronously available', async () => {
      await featureAppManager.preloadFeatureApp('/example.js');

      const asyncFeatureAppDefinition = featureAppManager.getAsyncFeatureAppDefinition(
        '/example.js'
      );

      expect(asyncFeatureAppDefinition.value).toBe(mockFeatureAppDefinition);
    });

    it('throws an error if no module loader was provided', () => {
      featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
        logger,
      });

      expect(() =>
        featureAppManager.getAsyncFeatureAppDefinition('/example.js')
      ).toThrowError(new Error('No module loader provided.'));
    });
  });

  describe('without a custom logger', () => {
    let consoleInfoSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleInfoSpy = jest.spyOn(console, 'info');
      featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry);
    });

    afterEach(() => {
      consoleInfoSpy.mockRestore();
    });

    it('logs messages using the console', () => {
      featureAppManager.createFeatureAppScope(
        'testId',
        mockFeatureAppDefinition
      );

      expect(consoleInfoSpy.mock.calls).toEqual([
        ['The Feature App with the ID "testId" has been successfully created.'],
      ]);
    });
  });
});
