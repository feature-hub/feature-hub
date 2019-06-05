// tslint:disable:no-implicit-dependencies

import {Stubbed, stubMethods} from 'jest-stub-methods';
import {
  FeatureAppDefinition,
  FeatureAppManager,
  FeatureServiceRegistry,
  FeatureServicesBinding,
  ModuleLoader
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
  let mockFeatureServicesBindingUnbind: () => void;
  let mockModuleLoader: ModuleLoader;
  let mockFeatureAppDefinition: FeatureAppDefinition<unknown>;
  let mockFeatureAppModule: FeatureAppModule | undefined;
  let mockFeatureAppCreate: jest.Mock;
  let mockFeatureApp: {};

  beforeEach(() => {
    mockFeatureServicesBindingUnbind = jest.fn();

    mockFeatureServicesBinding = {
      featureServices: {foo: {}},
      unbind: mockFeatureServicesBindingUnbind
    };

    mockFeatureServiceRegistry = {
      registerFeatureServices: jest.fn(),
      bindFeatureServices: jest.fn(() => mockFeatureServicesBinding)
    } as MockFeatureServiceRegistry;

    mockFeatureApp = {};
    mockFeatureAppCreate = jest.fn(() => mockFeatureApp);
    mockFeatureAppDefinition = {create: mockFeatureAppCreate, id: 'testId'};
    mockFeatureAppModule = {default: mockFeatureAppDefinition};
    mockModuleLoader = jest.fn(async () => mockFeatureAppModule);
    mockExternalsValidator = ({validate: jest.fn()} as Partial<
      ExternalsValidator
    >) as ExternalsValidator;

    featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
      logger
    });
  });

  describe('#getAsyncFeatureAppDefinition', () => {
    beforeEach(() => {
      featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
        logger,
        moduleLoader: mockModuleLoader
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
          'The Feature App module at the url "/example.js" has been successfully loaded.'
        ]
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
    });

    for (const invalidFeatureAppModule of [
      undefined,
      null,
      {},
      {default: {}},
      {default: {id: 'testId'}},
      {default: {create: jest.fn()}}
    ]) {
      describe(`when an invalid Feature App module (${JSON.stringify(
        invalidFeatureAppModule
      )}) has been loaded`, () => {
        beforeEach(() => {
          // tslint:disable-next-line:no-any
          mockFeatureAppModule = invalidFeatureAppModule as any;
        });

        it('throws an error (and stores it on the async value)', async () => {
          const expectedError = new Error(
            'The Feature App module at the url "/example.js" is invalid. A Feature App module must have a Feature App definition as default export. A Feature App definition is an object with at least an `id` string and a `create` method.'
          );

          await expect(
            featureAppManager.getAsyncFeatureAppDefinition('/example.js')
              .promise
          ).rejects.toEqual(expectedError);

          expect(
            featureAppManager.getAsyncFeatureAppDefinition('/example.js').error
          ).toEqual(expectedError);
        });
      });

      it('throws an error if no module loader was provided', () => {
        featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
          logger
        });

        expect(() =>
          featureAppManager.getAsyncFeatureAppDefinition('/example.js')
        ).toThrowError(new Error('No module loader provided.'));
      });
    }

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

  describe('#getFeatureAppScope', () => {
    it('creates a Feature App with a consumer environment using the Feature Service registry', () => {
      const config = {kind: 'test'};
      const idSpecifier = 'testIdSpecifier';
      const instanceConfig = 'testInstanceConfig';
      const baseUrl = '/base';

      featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
        configs: {[mockFeatureAppDefinition.id]: config},
        logger
      });

      featureAppManager.getFeatureAppScope(mockFeatureAppDefinition, {
        baseUrl,
        idSpecifier,
        instanceConfig
      });

      expect(mockFeatureServiceRegistry.bindFeatureServices.mock.calls).toEqual(
        [[mockFeatureAppDefinition, 'testId:testIdSpecifier']]
      );

      const {featureServices} = mockFeatureServicesBinding;

      expect(mockFeatureAppCreate.mock.calls).toEqual([
        [{baseUrl, config, instanceConfig, featureServices, idSpecifier}]
      ]);
    });

    describe('with a beforeCreate callback', () => {
      it('calls the beforeCreate callback prior to calling create', () => {
        featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
          logger
        });

        let beforeCreateCalled = false;

        const mockBeforeCreate = jest.fn(() => {
          beforeCreateCalled = true;
        });

        expect.assertions(2);

        mockFeatureAppCreate.mockImplementation(() => {
          expect(beforeCreateCalled).toBe(true);

          return mockFeatureApp;
        });

        featureAppManager.getFeatureAppScope(mockFeatureAppDefinition, {
          beforeCreate: mockBeforeCreate
        });

        const {featureServices} = mockFeatureServicesBinding;

        expect(mockBeforeCreate.mock.calls).toEqual([
          [mockFeatureAppDefinition.id, featureServices]
        ]);
      });

      describe('and no id specifier', () => {
        it('calls the beforeCreate callback without an enriched consumer id', () => {
          featureAppManager = new FeatureAppManager(
            mockFeatureServiceRegistry,
            {logger}
          );

          const mockBeforeCreate = jest.fn();

          featureAppManager.getFeatureAppScope(mockFeatureAppDefinition, {
            beforeCreate: mockBeforeCreate
          });

          const {featureServices} = mockFeatureServicesBinding;

          expect(mockBeforeCreate.mock.calls).toEqual([
            [mockFeatureAppDefinition.id, featureServices]
          ]);
        });
      });

      describe('and an id specifier', () => {
        it('calls the beforeCreate callback with an enriched consumer id', () => {
          const idSpecifier = 'testIdSpecifier';

          featureAppManager = new FeatureAppManager(
            mockFeatureServiceRegistry,
            {logger}
          );

          const mockBeforeCreate = jest.fn();

          featureAppManager.getFeatureAppScope(mockFeatureAppDefinition, {
            beforeCreate: mockBeforeCreate,
            idSpecifier
          });

          const {featureServices} = mockFeatureServicesBinding;

          expect(mockBeforeCreate.mock.calls).toEqual([
            [`${mockFeatureAppDefinition.id}:${idSpecifier}`, featureServices]
          ]);
        });
      });
    });

    describe('without an ExternalsValidator provided to the FeatureAppManager', () => {
      describe('with a Feature App definition that is declaring external dependencies', () => {
        beforeEach(() => {
          mockFeatureAppDefinition = {
            ...mockFeatureAppDefinition,
            dependencies: {
              externals: {
                react: '^16.0.0'
              }
            }
          };
        });

        it("doesn't throw an error", () => {
          expect(() => {
            featureAppManager.getFeatureAppScope(mockFeatureAppDefinition);
          }).not.toThrowError();
        });
      });
    });

    describe('with an ExternalsValidator provided to the FeatureAppManager', () => {
      beforeEach(() => {
        featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
          externalsValidator: mockExternalsValidator,
          logger
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
                react: '^16.0.0'
              }
            }
          };
        });

        it('calls the provided ExternalsValidator with the defined externals', () => {
          try {
            featureAppManager.getFeatureAppScope(mockFeatureAppDefinition);
          } catch {}

          expect(mockExternalsValidator.validate).toHaveBeenCalledWith({
            react: '^16.0.0'
          });
        });

        it('throws the validation error', () => {
          expect(() => {
            featureAppManager.getFeatureAppScope(mockFeatureAppDefinition);
          }).toThrowError(mockError);
        });
      });

      describe('with a Feature App definition that is not failing the externals validation', () => {
        beforeEach(() => {
          mockFeatureAppDefinition = {
            ...mockFeatureAppDefinition,
            dependencies: {
              externals: {
                react: '^16.0.0'
              }
            }
          };
        });

        it('calls the provided ExternalsValidator with the defined externals', () => {
          featureAppManager.getFeatureAppScope(mockFeatureAppDefinition);

          expect(mockExternalsValidator.validate).toHaveBeenCalledWith({
            react: '^16.0.0'
          });
        });

        it("doesn't throw an error", () => {
          expect(() => {
            featureAppManager.getFeatureAppScope(mockFeatureAppDefinition);
          }).not.toThrowError();
        });
      });

      describe('with a Feature App definition that declares no externals', () => {
        it('does not call the provided ExternalsValidator', () => {
          featureAppManager.getFeatureAppScope(mockFeatureAppDefinition);

          expect(mockExternalsValidator.validate).not.toHaveBeenCalled();
        });

        it("doesn't throw an error", () => {
          expect(() => {
            featureAppManager.getFeatureAppScope(mockFeatureAppDefinition);
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
          featureAppManager.getFeatureAppScope(mockFeatureAppDefinition)
        ).toThrowError(mockError);
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
          ownFeatureServiceDefinitions: [{id: 'ownId', create: jest.fn()}]
        };
      });

      it("registers the Feature App's own Feature Services before binding its required Feature Services", () => {
        featureAppManager.getFeatureAppScope(mockFeatureAppDefinition);

        expect(
          mockFeatureServiceRegistry.registerFeatureServices.mock.calls
        ).toEqual([
          [
            mockFeatureAppDefinition.ownFeatureServiceDefinitions,
            mockFeatureAppDefinition.id
          ]
        ]);

        expect(
          mockFeatureServiceRegistry.bindFeatureServices.mock.calls
        ).toEqual([[mockFeatureAppDefinition, mockFeatureAppDefinition.id]]);

        expect(featureServiceRegistryMethodCalls).toEqual([
          'registerFeatureServices',
          'bindFeatureServices'
        ]);
      });
    });

    describe('for a known Feature App definition', () => {
      describe('with a beforeCreate callback', () => {
        it('does not call the beforeCreate callback multiple times', () => {
          featureAppManager = new FeatureAppManager(
            mockFeatureServiceRegistry,
            {logger}
          );

          const mockBeforeCreate = jest.fn();

          featureAppManager.getFeatureAppScope(mockFeatureAppDefinition, {
            beforeCreate: mockBeforeCreate
          });

          featureAppManager.getFeatureAppScope(mockFeatureAppDefinition, {
            beforeCreate: mockBeforeCreate
          });

          const {featureServices} = mockFeatureServicesBinding;

          expect(mockBeforeCreate.mock.calls).toEqual([
            [mockFeatureAppDefinition.id, featureServices]
          ]);
        });

        describe('when destroy() is called on the Feature App scope', () => {
          it('calls the beforeCreate callback again', () => {
            featureAppManager = new FeatureAppManager(
              mockFeatureServiceRegistry,
              {logger}
            );

            const mockBeforeCreate = jest.fn();

            const featureAppScope = featureAppManager.getFeatureAppScope(
              mockFeatureAppDefinition,
              {beforeCreate: mockBeforeCreate}
            );

            featureAppScope.destroy();

            featureAppManager.getFeatureAppScope(mockFeatureAppDefinition, {
              beforeCreate: mockBeforeCreate
            });

            const {featureServices} = mockFeatureServicesBinding;

            expect(mockBeforeCreate.mock.calls).toEqual([
              [mockFeatureAppDefinition.id, featureServices],
              [mockFeatureAppDefinition.id, featureServices]
            ]);
          });
        });
      });

      describe('and no id specifier', () => {
        it('logs an info message after creation', () => {
          featureAppManager.getFeatureAppScope(mockFeatureAppDefinition);

          expect(logger.info.mock.calls).toEqual([
            ['The Feature App "testId" has been successfully created.']
          ]);
        });

        it('returns the same Feature App scope', () => {
          const featureAppScope = featureAppManager.getFeatureAppScope(
            mockFeatureAppDefinition
          );

          expect(
            featureAppManager.getFeatureAppScope(mockFeatureAppDefinition)
          ).toBe(featureAppScope);
        });

        describe('when destroy() is called on the Feature App scope', () => {
          it('returns another Feature App scope', () => {
            const featureAppScope = featureAppManager.getFeatureAppScope(
              mockFeatureAppDefinition
            );

            featureAppScope.destroy();

            expect(
              featureAppManager.getFeatureAppScope(mockFeatureAppDefinition)
            ).not.toBe(featureAppScope);
          });
        });
      });

      describe('and an id specifier', () => {
        it('logs an info message after creation', () => {
          featureAppManager.getFeatureAppScope(mockFeatureAppDefinition, {
            idSpecifier: 'testIdSpecifier'
          });

          expect(logger.info.mock.calls).toEqual([
            [
              'The Feature App "testId:testIdSpecifier" has been successfully created.'
            ]
          ]);
        });

        it('returns the same Feature App scope', () => {
          const featureAppScope = featureAppManager.getFeatureAppScope(
            mockFeatureAppDefinition,
            {idSpecifier: 'testIdSpecifier'}
          );

          expect(
            featureAppManager.getFeatureAppScope(mockFeatureAppDefinition, {
              idSpecifier: 'testIdSpecifier'
            })
          ).toBe(featureAppScope);
        });

        describe('when destroy() is called on the Feature App scope', () => {
          it('returns another Feature App scope', () => {
            const featureAppScope = featureAppManager.getFeatureAppScope(
              mockFeatureAppDefinition,
              {idSpecifier: 'testIdSpecifier'}
            );

            featureAppScope.destroy();

            expect(
              featureAppManager.getFeatureAppScope(mockFeatureAppDefinition, {
                idSpecifier: 'testIdSpecifier'
              })
            ).not.toBe(featureAppScope);
          });
        });
      });

      describe('and a different id specifier', () => {
        it('returns another Feature App scope', () => {
          const featureAppScope = featureAppManager.getFeatureAppScope(
            mockFeatureAppDefinition
          );

          expect(
            featureAppManager.getFeatureAppScope(mockFeatureAppDefinition, {
              idSpecifier: 'testIdSpecifier'
            })
          ).not.toBe(featureAppScope);
        });
      });
    });

    describe('#featureApp', () => {
      it("is the Feature App that the Feature App definition's create returns", () => {
        const featureAppScope = featureAppManager.getFeatureAppScope(
          mockFeatureAppDefinition
        );

        expect(featureAppScope.featureApp).toBe(mockFeatureApp);
      });
    });

    describe('#destroy', () => {
      it('unbinds the bound Feature Services', () => {
        const featureAppScope = featureAppManager.getFeatureAppScope(
          mockFeatureAppDefinition
        );

        featureAppScope.destroy();

        expect(mockFeatureServicesBindingUnbind).toHaveBeenCalledTimes(1);
      });

      it('throws an error when destroy is called multiple times', () => {
        const featureAppScope = featureAppManager.getFeatureAppScope(
          mockFeatureAppDefinition,
          {idSpecifier: 'testIdSpecifier'}
        );

        featureAppScope.destroy();

        expect(() => featureAppScope.destroy()).toThrowError(
          new Error(
            'The Feature App "testId:testIdSpecifier" could not be destroyed.'
          )
        );
      });

      it('fails to destroy an already destroyed Feature App scope, even if this scope has been re-created', () => {
        const featureAppScope = featureAppManager.getFeatureAppScope(
          mockFeatureAppDefinition,
          {idSpecifier: 'testIdSpecifier'}
        );

        featureAppScope.destroy();
        featureAppManager.getFeatureAppScope(mockFeatureAppDefinition, {
          idSpecifier: 'testIdSpecifier'
        });

        expect(() => featureAppScope.destroy()).toThrowError(
          new Error(
            'The Feature App "testId:testIdSpecifier" could not be destroyed.'
          )
        );
      });
    });
  });

  describe('#preloadFeatureApp', () => {
    beforeEach(() => {
      featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry, {
        moduleLoader: mockModuleLoader,
        logger
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
        logger
      });

      expect(() =>
        featureAppManager.getAsyncFeatureAppDefinition('/example.js')
      ).toThrowError(new Error('No module loader provided.'));
    });
  });

  describe('without a custom logger', () => {
    let stubbedConsole: Stubbed<Console>;

    beforeEach(() => {
      stubbedConsole = stubMethods(console);
      featureAppManager = new FeatureAppManager(mockFeatureServiceRegistry);
    });

    afterEach(() => {
      stubbedConsole.restore();
    });

    it('logs messages using the console', () => {
      featureAppManager.getFeatureAppScope(mockFeatureAppDefinition);

      expect(stubbedConsole.stub.info.mock.calls).toEqual([
        ['The Feature App "testId" has been successfully created.']
      ]);
    });
  });
});
