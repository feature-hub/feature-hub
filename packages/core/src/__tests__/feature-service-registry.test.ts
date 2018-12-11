import {
  FeatureServiceBinding,
  FeatureServiceConfigs,
  FeatureServiceConsumerDefinition,
  FeatureServiceRegistry,
  FeatureServiceRegistryLike
} from '..';

interface MockProviderDefinition extends FeatureServiceConsumerDefinition {
  create: jest.Mock;
}

interface MockFeatureService {
  kind: string;
}

interface MockFeatureServiceBinding
  extends FeatureServiceBinding<MockFeatureService> {
  unbind?: jest.Mock;
}

describe('FeatureServiceRegistry', () => {
  let registry: FeatureServiceRegistryLike;
  let providerDefinitionA: MockProviderDefinition;
  let providerDefinitionB: MockProviderDefinition;
  let providerDefinitionC: MockProviderDefinition;
  let binderA: jest.Mock;
  let binderB: jest.Mock;
  let binderC: jest.Mock;
  let bindingA: MockFeatureServiceBinding;
  let bindingB: MockFeatureServiceBinding;
  let bindingC: MockFeatureServiceBinding;
  let featureServiceA: MockFeatureService;
  let featureServiceB: MockFeatureService;
  let featureServiceC: MockFeatureService;
  let spyConsoleError: jest.SpyInstance;
  let spyConsoleInfo: jest.SpyInstance;
  let spyConsoleWarn: jest.SpyInstance;

  beforeEach(() => {
    registry = new FeatureServiceRegistry();

    featureServiceA = {kind: 'featureServiceA'};
    bindingA = {featureService: featureServiceA};
    binderA = jest.fn(() => bindingA);

    providerDefinitionA = {
      id: 'a',
      create: jest.fn(() => ({'1.1': binderA}))
    };

    featureServiceB = {kind: 'featureServiceB'};
    bindingB = {featureService: featureServiceB};
    binderB = jest.fn(() => bindingB);

    providerDefinitionB = {
      id: 'b',
      dependencies: {a: '^1.0'},
      create: jest.fn(() => ({'1.0': binderB}))
    };

    featureServiceC = {kind: 'featureServiceC'};
    bindingC = {featureService: featureServiceC};
    binderC = jest.fn(() => bindingC);

    providerDefinitionC = {
      id: 'c',
      dependencies: {a: '^1.0', b: '1.0'},
      create: jest.fn(() => ({'2.0': binderC}))
    };

    spyConsoleError = jest.spyOn(console, 'error');
    spyConsoleError.mockImplementation(jest.fn());

    spyConsoleInfo = jest.spyOn(console, 'info');
    spyConsoleInfo.mockImplementation(jest.fn());

    spyConsoleWarn = jest.spyOn(console, 'warn');
    spyConsoleWarn.mockImplementation(jest.fn());
  });

  afterEach(() => {
    spyConsoleError.mockRestore();
    spyConsoleInfo.mockRestore();
    spyConsoleWarn.mockRestore();
  });

  describe('#registerProviders', () => {
    let configs: FeatureServiceConfigs;

    function testRegistrationOrderABC(): void {
      expect(providerDefinitionA.create.mock.calls).toEqual([
        [{config: configs.a, featureServices: {}}]
      ]);

      expect(binderA.mock.calls).toEqual([['b'], ['c']]);

      expect(providerDefinitionB.create.mock.calls).toEqual([
        [{featureServices: {a: featureServiceA}}]
      ]);

      expect(binderB.mock.calls).toEqual([['c']]);

      expect(providerDefinitionC.create.mock.calls).toEqual([
        [
          {
            config: configs.c,
            featureServices: {a: featureServiceA, b: featureServiceB}
          }
        ]
      ]);

      expect(binderC.mock.calls).toEqual([]);

      expect(spyConsoleInfo.mock.calls).toEqual([
        [
          'All required feature services have been successfully bound to the consumer "a".'
        ],
        [
          'The feature service provider "a" has been successfully registered by the consumer "test".'
        ],
        [
          'All required feature services have been successfully bound to the consumer "b".'
        ],
        [
          'The feature service provider "b" has been successfully registered by the consumer "test".'
        ],
        [
          'All required feature services have been successfully bound to the consumer "c".'
        ],
        [
          'The feature service provider "c" has been successfully registered by the consumer "test".'
        ]
      ]);
    }

    beforeEach(() => {
      configs = {a: {kind: 'a'}, c: {kind: 'c'}};
      registry = new FeatureServiceRegistry(configs);
    });

    it('registers the feature service providers "a", "b", "c" one after the other', () => {
      registry.registerProviders([providerDefinitionA], 'test');
      registry.registerProviders([providerDefinitionB], 'test');
      registry.registerProviders([providerDefinitionC], 'test');

      testRegistrationOrderABC();
    });

    it('registers the feature service providers "a", "b", "c" all at once in topologically sorted order', () => {
      registry.registerProviders(
        [providerDefinitionB, providerDefinitionC, providerDefinitionA],
        'test'
      );

      testRegistrationOrderABC();
    });

    it('does not register the already existing feature service provider "a"', () => {
      registry.registerProviders([providerDefinitionA], 'test');
      registry.registerProviders([providerDefinitionA], 'test');

      expect(providerDefinitionA.create.mock.calls).toEqual([
        [{config: configs.a, featureServices: {}}]
      ]);

      expect(binderA.mock.calls).toEqual([]);

      expect(spyConsoleInfo.mock.calls).toEqual([
        [
          'All required feature services have been successfully bound to the consumer "a".'
        ],
        [
          'The feature service provider "a" has been successfully registered by the consumer "test".'
        ]
      ]);

      expect(spyConsoleWarn.mock.calls).toEqual([
        [
          'The already registered feature service provider "a" could not be re-registered by the consumer "test".'
        ]
      ]);
    });

    it('fails to register the feature service provider "b" due to the lack of dependency "a"', () => {
      expect(() =>
        registry.registerProviders([providerDefinitionB], 'test')
      ).toThrowError(
        'The required feature service in version "^1.0" of the unregistered provider "a" could not be bound to the consumer "b".'
      );
    });

    it('fails to register the feature service provider "d" due to an unsupported dependency version', () => {
      const stateProviderD = {
        id: 'd',
        dependencies: {a: '1.0'},
        create: jest.fn()
      };

      expect(() =>
        registry.registerProviders(
          [providerDefinitionA, stateProviderD],
          'test'
        )
      ).toThrowError(
        'The required feature service in the unsupported version "1.0" of the provider "a" could not be bound to the consumer "d". The supported versions are ["1.1"].'
      );
    });

    it('fails to register the feature service provider "d" due to an invalid dependency version', () => {
      const stateProviderDefinitionD = {
        id: 'd',
        dependencies: {a: ''},
        create: jest.fn()
      };

      expect(() =>
        registry.registerProviders(
          [providerDefinitionA, stateProviderDefinitionD],
          'test'
        )
      ).toThrowError(
        'The required unknown feature service of the provider "a" could not be bound to the consumer "d".'
      );
    });

    it('fails to register the feature service provider "e" due to a dependency with an invalid version', () => {
      const stateProviderDefinitionD = {
        id: 'd',
        dependencies: {},
        create: () => ({foo: jest.fn()})
      };

      const stateProviderDefinitionE = {
        id: 'e',
        dependencies: {d: '1.0'},
        create: jest.fn()
      };

      expect(() =>
        registry.registerProviders(
          [stateProviderDefinitionD, stateProviderDefinitionE],
          'test'
        )
      ).toThrowError(
        'The required feature service in version "1.0" of the provider "d" could not be bound to the consumer "e" due to an invalid provider version "foo".'
      );
    });
  });

  describe('#bindFeatureServices', () => {
    describe('for a feature service consumer without dependencies', () => {
      it('creates a bindings object with no feature services', () => {
        expect(registry.bindFeatureServices({id: 'foo'})).toEqual({
          featureServices: {},
          unbind: expect.any(Function)
        });
      });
    });

    describe('for a feature service consumer with an id specifier and dependencies', () => {
      it('creates a bindings object with feature services', () => {
        registry = new FeatureServiceRegistry();

        registry.registerProviders([providerDefinitionA], 'test');

        expect(binderA.mock.calls).toEqual([]);

        expect(
          registry.bindFeatureServices(
            {id: 'foo', dependencies: {a: '1.1'}},
            'bar'
          )
        ).toEqual({
          featureServices: {a: featureServiceA},
          unbind: expect.any(Function)
        });

        expect(binderA.mock.calls).toEqual([['foo:bar']]);
      });
    });

    it('fails to create a bindings object for an consumer which is already bound', () => {
      registry.bindFeatureServices({id: 'foo'});
      registry.bindFeatureServices({id: 'foo'}, 'bar');
      registry.bindFeatureServices({id: 'foo'}, 'baz');

      expect(() =>
        registry.bindFeatureServices({id: 'foo'}, 'baz')
      ).toThrowError(
        'All required feature services are already bound to the consumer "foo:baz".'
      );
    });

    describe('#unbind', () => {
      it('unbinds the consumer', () => {
        const bindings = registry.bindFeatureServices(providerDefinitionA);

        bindings.unbind();

        expect(() =>
          registry.bindFeatureServices(providerDefinitionA)
        ).not.toThrowError();
      });

      it('unbinds all consumers if applicable, errors are ignored', () => {
        const mockError = new Error('I should be caught.');

        bindingA.unbind = jest.fn(() => {
          throw mockError;
        });

        // The "bindingB" intentionally has no destroy method.

        bindingC.unbind = jest.fn();

        registry.registerProviders(
          [providerDefinitionA, providerDefinitionB, providerDefinitionC],
          'test'
        );

        const bindings = registry.bindFeatureServices({
          id: 'foo',
          dependencies: {a: '1.1', b: '1.0', c: '2.0'}
        });

        bindings.unbind();

        expect(bindingA.unbind).toHaveBeenCalledTimes(1);
        expect(bindingC.unbind).toHaveBeenCalledTimes(1);

        expect(spyConsoleInfo.mock.calls).toEqual([
          [
            'All required feature services have been successfully bound to the consumer "a".'
          ],
          [
            'The feature service provider "a" has been successfully registered by the consumer "test".'
          ],
          [
            'All required feature services have been successfully bound to the consumer "b".'
          ],
          [
            'The feature service provider "b" has been successfully registered by the consumer "test".'
          ],
          [
            'All required feature services have been successfully bound to the consumer "c".'
          ],
          [
            'The feature service provider "c" has been successfully registered by the consumer "test".'
          ],
          [
            'All required feature services have been successfully bound to the consumer "foo".'
          ],
          [
            'The required feature service of the provider "b" has been successfully unbound from the consumer "foo".'
          ],
          [
            'The required feature service of the provider "c" has been successfully unbound from the consumer "foo".'
          ]
        ]);

        expect(spyConsoleError.mock.calls).toEqual([
          [
            'The required feature service of the provider "a" could not be unbound from the consumer "foo".',
            mockError
          ]
        ]);
      });

      it('fails to unbind an already unbound consumer', () => {
        const bindings = registry.bindFeatureServices(providerDefinitionA);

        bindings.unbind();

        expect(() => bindings.unbind()).toThrowError(
          new Error(
            'All required feature services are already unbound from the consumer "a".'
          )
        );
      });

      it('fails to unbind an already unbound consumer, even if this consumer has been re-bound', () => {
        const bindings = registry.bindFeatureServices(providerDefinitionA);

        bindings.unbind();

        registry.bindFeatureServices(providerDefinitionA);

        expect(() => bindings.unbind()).toThrowError(
          new Error(
            'All required feature services are already unbound from the consumer "a".'
          )
        );
      });
    });
  });
});
