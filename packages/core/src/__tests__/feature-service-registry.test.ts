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

  describe('#registerFeatureServices', () => {
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
          'The Feature Service "a" has been successfully registered by consumer "test".'
        ],
        [
          'The required Feature Service "a" has been successfully bound to consumer "b".'
        ],
        [
          'The Feature Service "b" has been successfully registered by consumer "test".'
        ],
        [
          'The required Feature Service "a" has been successfully bound to consumer "c".'
        ],
        [
          'The required Feature Service "b" has been successfully bound to consumer "c".'
        ],
        [
          'The Feature Service "c" has been successfully registered by consumer "test".'
        ]
      ]);
    }

    beforeEach(() => {
      configs = {a: {kind: 'a'}, c: {kind: 'c'}};
      registry = new FeatureServiceRegistry({configs});
    });

    it('registers the Feature Services "a", "b", "c" one after the other', () => {
      registry.registerFeatureServices([providerDefinitionA], 'test');
      registry.registerFeatureServices([providerDefinitionB], 'test');
      registry.registerFeatureServices([providerDefinitionC], 'test');

      testRegistrationOrderABC();
    });

    it('registers the Feature Services "a", "b", "c" all at once in topologically sorted order', () => {
      registry.registerFeatureServices(
        [providerDefinitionB, providerDefinitionC, providerDefinitionA],
        'test'
      );

      testRegistrationOrderABC();
    });

    it('does not register the already existing Feature Service "a"', () => {
      registry.registerFeatureServices([providerDefinitionA], 'test');
      registry.registerFeatureServices([providerDefinitionA], 'test');

      expect(providerDefinitionA.create.mock.calls).toEqual([
        [{config: configs.a, featureServices: {}}]
      ]);

      expect(binderA.mock.calls).toEqual([]);

      expect(spyConsoleInfo.mock.calls).toEqual([
        [
          'The Feature Service "a" has been successfully registered by consumer "test".'
        ]
      ]);

      expect(spyConsoleWarn.mock.calls).toEqual([
        [
          'The already registered Feature Service "a" could not be re-registered by consumer "test".'
        ]
      ]);
    });

    it('fails to register the Feature Service "b" due to the lack of dependency "a"', () => {
      expect(() =>
        registry.registerFeatureServices([providerDefinitionB], 'test')
      ).toThrowError(
        new Error(
          'The required Feature Service "a" is not registered and therefore could not be bound to consumer "b".'
        )
      );
    });

    it('fails to register the Feature Service "d" due to an unsupported dependency version', () => {
      const stateProviderD = {
        id: 'd',
        dependencies: {a: '1.0'},
        create: jest.fn()
      };

      expect(() =>
        registry.registerFeatureServices(
          [providerDefinitionA, stateProviderD],
          'test'
        )
      ).toThrowError(
        new Error(
          'The required Feature Service "a" in the unsupported version "1.0" could not be bound to consumer "d". The supported versions are ["1.1"].'
        )
      );
    });

    it('fails to register the Feature Service "d" due to an invalid dependency version', () => {
      const stateProviderDefinitionD = {
        id: 'd',
        dependencies: {a: ''},
        create: jest.fn()
      };

      expect(() =>
        registry.registerFeatureServices(
          [providerDefinitionA, stateProviderDefinitionD],
          'test'
        )
      ).toThrowError(
        new Error(
          'The required Feature Service "a" in an invalid version could not be bound to consumer "d".'
        )
      );
    });

    it('fails to register the Feature Service "e" due to a dependency with an invalid version', () => {
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
        registry.registerFeatureServices(
          [stateProviderDefinitionD, stateProviderDefinitionE],
          'test'
        )
      ).toThrowError(
        new Error(
          'The required Feature Service "d" in the unsupported version "1.0" could not be bound to consumer "e". The supported versions are ["foo"].'
        )
      );
    });
  });

  describe('#bindFeatureServices', () => {
    describe('for a Feature Service consumer without dependencies', () => {
      it('creates a bindings object with no Feature Services', () => {
        expect(registry.bindFeatureServices({id: 'foo'})).toEqual({
          featureServices: {},
          unbind: expect.any(Function)
        });
      });
    });

    describe('for a Feature Service consumer with an id specifier and dependencies', () => {
      it('creates a bindings object with Feature Services', () => {
        registry = new FeatureServiceRegistry();

        registry.registerFeatureServices([providerDefinitionA], 'test');

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
        new Error(
          'All required Feature Services are already bound to consumer "foo:baz".'
        )
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

        registry.registerFeatureServices(
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
            'The Feature Service "a" has been successfully registered by consumer "test".'
          ],
          [
            'The required Feature Service "a" has been successfully bound to consumer "b".'
          ],
          [
            'The Feature Service "b" has been successfully registered by consumer "test".'
          ],
          [
            'The required Feature Service "a" has been successfully bound to consumer "c".'
          ],
          [
            'The required Feature Service "b" has been successfully bound to consumer "c".'
          ],
          [
            'The Feature Service "c" has been successfully registered by consumer "test".'
          ],
          [
            'The required Feature Service "a" has been successfully bound to consumer "foo".'
          ],
          [
            'The required Feature Service "b" has been successfully bound to consumer "foo".'
          ],
          [
            'The required Feature Service "c" has been successfully bound to consumer "foo".'
          ],
          [
            'The required Feature Service "b" has been successfully unbound from consumer "foo".'
          ],
          [
            'The required Feature Service "c" has been successfully unbound from consumer "foo".'
          ]
        ]);

        expect(spyConsoleError.mock.calls).toEqual([
          [
            'The required Feature Service "a" could not be unbound from consumer "foo".',
            mockError
          ]
        ]);
      });

      it('fails to unbind an already unbound consumer', () => {
        const bindings = registry.bindFeatureServices(providerDefinitionA);

        bindings.unbind();

        expect(() => bindings.unbind()).toThrowError(
          new Error(
            'All required Feature Services are already unbound from consumer "a".'
          )
        );
      });

      it('fails to unbind an already unbound consumer, even if this consumer has been re-bound', () => {
        const bindings = registry.bindFeatureServices(providerDefinitionA);

        bindings.unbind();

        registry.bindFeatureServices(providerDefinitionA);

        expect(() => bindings.unbind()).toThrowError(
          new Error(
            'All required Feature Services are already unbound from consumer "a".'
          )
        );
      });
    });
  });
});
