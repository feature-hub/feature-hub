import {
  FeatureAppDefinition,
  FeatureAppManager,
  FeatureAppManagerLike,
  FeatureServiceRegistryLike,
  FeatureServicesBinding,
  ModuleLoader
} from '..';
import {FeatureAppModule} from '../internal/is-feature-app-module';

interface MockFeatureServiceRegistry extends FeatureServiceRegistryLike {
  registerFeatureServices: jest.Mock;
  bindFeatureServices: jest.Mock;
}

describe('FeatureAppManager', () => {
  let manager: FeatureAppManagerLike;
  let mockRegistry: MockFeatureServiceRegistry;
  let mockFeatureServicesBinding: FeatureServicesBinding;
  let mockFeatureServicesBindingUnbind: () => void;
  let mockModuleLoader: ModuleLoader;
  let mockFeatureAppDefinition: FeatureAppDefinition<unknown>;
  let mockFeatureAppModule: FeatureAppModule | undefined;
  let mockFeatureAppCreate: jest.Mock;
  let mockFeatureApp: {};
  let spyConsoleInfo: jest.SpyInstance;

  beforeEach(() => {
    mockFeatureServicesBindingUnbind = jest.fn();

    mockFeatureServicesBinding = {
      featureServices: {foo: {}},
      unbind: mockFeatureServicesBindingUnbind
    };

    mockRegistry = {
      registerFeatureServices: jest.fn(),
      bindFeatureServices: jest.fn(() => mockFeatureServicesBinding)
    };

    mockFeatureApp = {};
    mockFeatureAppCreate = jest.fn(() => mockFeatureApp);
    mockFeatureAppDefinition = {create: mockFeatureAppCreate, id: 'testId'};
    mockFeatureAppModule = {default: mockFeatureAppDefinition};
    mockModuleLoader = jest.fn(async () => mockFeatureAppModule);
    manager = new FeatureAppManager(mockRegistry);

    spyConsoleInfo = jest.spyOn(console, 'info');
    spyConsoleInfo.mockImplementation(jest.fn());
  });

  afterEach(() => {
    spyConsoleInfo.mockRestore();
  });

  describe('#getAsyncFeatureAppDefinition', () => {
    beforeEach(() => {
      manager = new FeatureAppManager(mockRegistry, {
        moduleLoader: mockModuleLoader
      });
    });

    it('logs an info message when the Feature App module was loaded', async () => {
      const asyncFeatureAppDefinition = manager.getAsyncFeatureAppDefinition(
        '/example.js'
      );

      expect(spyConsoleInfo.mock.calls).toEqual([]);

      await asyncFeatureAppDefinition.promise;

      expect(spyConsoleInfo.mock.calls).toEqual([
        [
          'The Feature App module for the url "/example.js" has been successfully loaded.'
        ]
      ]);
    });

    it('returns an async value for a Feature App definition', async () => {
      const asyncFeatureAppDefinition = manager.getAsyncFeatureAppDefinition(
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
            'The Feature App module for the url "/example.js" is invalid. A Feature App module must have a Feature App definition as default export. A Feature App definition is an object with at least an `id` string and a `create` method.'
          );

          await expect(
            manager.getAsyncFeatureAppDefinition('/example.js').promise
          ).rejects.toEqual(expectedError);

          expect(
            manager.getAsyncFeatureAppDefinition('/example.js').error
          ).toEqual(expectedError);
        });
      });

      it('throws an error if no module loader was provided', () => {
        manager = new FeatureAppManager(mockRegistry);

        expect(() =>
          manager.getAsyncFeatureAppDefinition('/example.js')
        ).toThrowError(new Error('No module loader provided.'));
      });
    }

    describe('for a known Feature App module url', () => {
      it('returns the same async Feature App definition', () => {
        const asyncFeatureAppDefinition = manager.getAsyncFeatureAppDefinition(
          '/example.js'
        );

        expect(manager.getAsyncFeatureAppDefinition('/example.js')).toBe(
          asyncFeatureAppDefinition
        );
      });
    });
  });

  describe('#getFeatureAppScope', () => {
    it('creates a Feature App with a consumer environment using the Feature Service registry', () => {
      const mockConfig = {kind: 'test'};
      const idSpecifier = 'testIdSpecifier';

      manager = new FeatureAppManager(mockRegistry, {
        configs: {[mockFeatureAppDefinition.id]: mockConfig}
      });

      manager.getFeatureAppScope(mockFeatureAppDefinition, idSpecifier);

      expect(mockRegistry.bindFeatureServices.mock.calls).toEqual([
        [mockFeatureAppDefinition, idSpecifier]
      ]);

      const {featureServices} = mockFeatureServicesBinding;

      expect(mockFeatureAppCreate.mock.calls).toEqual([
        [{config: mockConfig, featureServices, idSpecifier}]
      ]);
    });

    describe('with a Feature App definition with own Feature Service definitions', () => {
      let registryMethodCalls: string[];

      beforeEach(() => {
        registryMethodCalls = [];

        mockRegistry.registerFeatureServices.mockImplementation(() => {
          registryMethodCalls.push('registerFeatureServices');
        });

        mockRegistry.bindFeatureServices.mockImplementation(() => {
          registryMethodCalls.push('bindFeatureServices');

          return mockFeatureServicesBinding;
        });

        mockFeatureAppDefinition = {
          ...mockFeatureAppDefinition,
          ownFeatureServiceDefinitions: [{id: 'ownId', create: jest.fn()}]
        };
      });

      it("registers the Feature App's own Feature Services before binding its required Feature Services", () => {
        manager.getFeatureAppScope(mockFeatureAppDefinition, 'testIdSpecifier');

        expect(mockRegistry.registerFeatureServices.mock.calls).toEqual([
          [mockFeatureAppDefinition.ownFeatureServiceDefinitions, 'testId']
        ]);

        expect(mockRegistry.bindFeatureServices.mock.calls).toEqual([
          [mockFeatureAppDefinition, 'testIdSpecifier']
        ]);

        expect(registryMethodCalls).toEqual([
          'registerFeatureServices',
          'bindFeatureServices'
        ]);
      });
    });

    describe('for a known Feature App definition', () => {
      describe('and no id specifier', () => {
        it('logs an info message after creation', () => {
          manager.getFeatureAppScope(mockFeatureAppDefinition);

          expect(spyConsoleInfo.mock.calls).toEqual([
            ['The Feature App "testId" has been successfully created.']
          ]);
        });

        it('returns the same Feature App scope', () => {
          const featureAppScope = manager.getFeatureAppScope(
            mockFeatureAppDefinition
          );

          expect(manager.getFeatureAppScope(mockFeatureAppDefinition)).toBe(
            featureAppScope
          );
        });

        describe('when destroy() is called on the Feature App scope', () => {
          it('returns another Feature App scope', () => {
            const featureAppScope = manager.getFeatureAppScope(
              mockFeatureAppDefinition
            );

            featureAppScope.destroy();

            expect(
              manager.getFeatureAppScope(mockFeatureAppDefinition)
            ).not.toBe(featureAppScope);
          });
        });
      });

      describe('and an id specifier', () => {
        it('logs an info message after creation', () => {
          manager.getFeatureAppScope(
            mockFeatureAppDefinition,
            'testIdSpecifier'
          );

          expect(spyConsoleInfo.mock.calls).toEqual([
            [
              'The Feature App "testId:testIdSpecifier" has been successfully created.'
            ]
          ]);
        });

        it('returns the same Feature App scope', () => {
          const featureAppScope = manager.getFeatureAppScope(
            mockFeatureAppDefinition,
            'testIdSpecifier'
          );

          expect(
            manager.getFeatureAppScope(
              mockFeatureAppDefinition,
              'testIdSpecifier'
            )
          ).toBe(featureAppScope);
        });

        describe('when destroy() is called on the Feature App scope', () => {
          it('returns another Feature App scope', () => {
            const featureAppScope = manager.getFeatureAppScope(
              mockFeatureAppDefinition,
              'testIdSpecifier'
            );

            featureAppScope.destroy();

            expect(
              manager.getFeatureAppScope(
                mockFeatureAppDefinition,
                'testIdSpecifier'
              )
            ).not.toBe(featureAppScope);
          });
        });
      });

      describe('and a different id specifier', () => {
        it('returns another Feature App scope', () => {
          const featureAppScope = manager.getFeatureAppScope(
            mockFeatureAppDefinition
          );

          expect(
            manager.getFeatureAppScope(
              mockFeatureAppDefinition,
              'testIdSpecifier'
            )
          ).not.toBe(featureAppScope);
        });
      });
    });

    describe('#featureApp', () => {
      it("is the Feature App that the Feature App definition's create returns", () => {
        const featureAppScope = manager.getFeatureAppScope(
          mockFeatureAppDefinition
        );

        expect(featureAppScope.featureApp).toBe(mockFeatureApp);
      });
    });

    describe('#destroy', () => {
      it('unbinds the bound Feature Services', () => {
        const featureAppScope = manager.getFeatureAppScope(
          mockFeatureAppDefinition
        );

        featureAppScope.destroy();

        expect(mockFeatureServicesBindingUnbind).toHaveBeenCalledTimes(1);
      });

      it('throws an error when destroy is called multiple times', () => {
        const featureAppScope = manager.getFeatureAppScope(
          mockFeatureAppDefinition,
          'testIdSpecifier'
        );

        featureAppScope.destroy();

        expect(() => featureAppScope.destroy()).toThrowError(
          new Error(
            'The Feature App "testId:testIdSpecifier" could not be destroyed.'
          )
        );
      });

      it('fails to destroy an already destroyed Feature App scope, even if this scope has been re-created', () => {
        const featureAppScope = manager.getFeatureAppScope(
          mockFeatureAppDefinition,
          'testIdSpecifier'
        );

        featureAppScope.destroy();
        manager.getFeatureAppScope(mockFeatureAppDefinition, 'testIdSpecifier');

        expect(() => featureAppScope.destroy()).toThrowError(
          new Error(
            'The Feature App "testId:testIdSpecifier" could not be destroyed.'
          )
        );
      });
    });
  });

  describe('#destroy', () => {
    it('unbinds the bound Feature Services for all Feature Apps', () => {
      manager.getFeatureAppScope(mockFeatureAppDefinition, 'test1');
      manager.getFeatureAppScope(mockFeatureAppDefinition, 'test2');
      manager.destroy();

      expect(mockFeatureServicesBindingUnbind).toHaveBeenCalledTimes(2);
    });
  });

  describe('#preloadFeatureApp', () => {
    beforeEach(() => {
      manager = new FeatureAppManager(mockRegistry, {
        moduleLoader: mockModuleLoader
      });
    });

    it('preloads a Feature App definition so that the scope is synchronously available', async () => {
      await manager.preloadFeatureApp('/example.js');

      const asyncFeatureAppDefinition = manager.getAsyncFeatureAppDefinition(
        '/example.js'
      );

      expect(asyncFeatureAppDefinition.value).toBe(mockFeatureAppDefinition);
    });

    it('throws an error if no module loader was provided', () => {
      manager = new FeatureAppManager(mockRegistry);

      expect(() =>
        manager.getAsyncFeatureAppDefinition('/example.js')
      ).toThrowError(new Error('No module loader provided.'));
    });
  });
});
