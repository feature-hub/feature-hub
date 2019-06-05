// tslint:disable:no-implicit-dependencies

import {Stubbed, stubMethods} from 'jest-stub-methods';
import {
  FeatureServiceBinding,
  FeatureServiceProviderDefinition,
  FeatureServiceRegistry,
  SharedFeatureService
} from '..';
import {ExternalsValidator} from '../externals-validator';
import {logger} from './logger';

interface MockProviderDefinition
  extends FeatureServiceProviderDefinition<SharedFeatureService> {
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
  let featureServiceRegistry: FeatureServiceRegistry;
  let mockExternalsValidator: ExternalsValidator;
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

  beforeEach(() => {
    mockExternalsValidator = ({validate: jest.fn()} as Partial<
      ExternalsValidator
    >) as ExternalsValidator;

    featureServiceRegistry = new FeatureServiceRegistry({logger});

    featureServiceA = {kind: 'featureServiceA'};
    bindingA = {featureService: featureServiceA};
    binderA = jest.fn(() => bindingA);

    providerDefinitionA = {
      id: 'a',
      create: jest.fn(() => ({'1.1.0': binderA}))
    };

    featureServiceB = {kind: 'featureServiceB'};
    bindingB = {featureService: featureServiceB};
    binderB = jest.fn(() => bindingB);

    providerDefinitionB = {
      id: 'b',
      optionalDependencies: {featureServices: {a: '^1.0.0'}},
      create: jest.fn(() => ({'1.0.0': binderB}))
    };

    featureServiceC = {kind: 'featureServiceC'};
    bindingC = {featureService: featureServiceC};
    binderC = jest.fn(() => bindingC);

    providerDefinitionC = {
      id: 'c',
      dependencies: {featureServices: {a: '^1.0.0', b: '1.0.0'}},
      create: jest.fn(() => ({'2.0.0': binderC}))
    };
  });

  describe('#registerFeatureServices', () => {
    function testRegistrationOrderABC(): void {
      expect(providerDefinitionA.create.mock.calls).toEqual([
        [{featureServices: {}}]
      ]);

      expect(binderA.mock.calls).toEqual([['b'], ['c']]);

      expect(providerDefinitionB.create.mock.calls).toEqual([
        [{featureServices: {a: featureServiceA}}]
      ]);

      expect(binderB.mock.calls).toEqual([['c']]);

      expect(providerDefinitionC.create.mock.calls).toEqual([
        [{featureServices: {a: featureServiceA, b: featureServiceB}}]
      ]);

      expect(binderC.mock.calls).toEqual([]);

      expect(logger.info.mock.calls).toEqual([
        [
          'The Feature Service "a" has been successfully registered by registrant "test".'
        ],
        [
          'The required Feature Service "a" has been successfully bound to consumer "b".'
        ],
        [
          'The Feature Service "b" has been successfully registered by registrant "test".'
        ],
        [
          'The required Feature Service "a" has been successfully bound to consumer "c".'
        ],
        [
          'The required Feature Service "b" has been successfully bound to consumer "c".'
        ],
        [
          'The Feature Service "c" has been successfully registered by registrant "test".'
        ]
      ]);
    }
    beforeEach(() => {
      featureServiceRegistry = new FeatureServiceRegistry({logger});
    });

    it('registers the Feature Services "a", "b", "c" one after the other', () => {
      featureServiceRegistry.registerFeatureServices(
        [providerDefinitionA],
        'test'
      );
      featureServiceRegistry.registerFeatureServices(
        [providerDefinitionB],
        'test'
      );
      featureServiceRegistry.registerFeatureServices(
        [providerDefinitionC],
        'test'
      );

      testRegistrationOrderABC();
    });

    it('registers the Feature Services "a", "b", "c" all at once in topologically sorted order', () => {
      featureServiceRegistry.registerFeatureServices(
        [providerDefinitionB, providerDefinitionC, providerDefinitionA],
        'test'
      );

      testRegistrationOrderABC();
    });

    it('does not register the already existing Feature Service "a"', () => {
      featureServiceRegistry.registerFeatureServices(
        [providerDefinitionA],
        'test'
      );
      featureServiceRegistry.registerFeatureServices(
        [providerDefinitionA],
        'test'
      );

      expect(providerDefinitionA.create.mock.calls).toEqual([
        [{featureServices: {}}]
      ]);

      expect(binderA.mock.calls).toEqual([]);

      expect(logger.info.mock.calls).toEqual([
        [
          'The Feature Service "a" has been successfully registered by registrant "test".'
        ]
      ]);

      expect(logger.warn.mock.calls).toEqual([
        [
          'The already registered Feature Service "a" could not be re-registered by registrant "test".'
        ]
      ]);
    });

    it('fails to register the Feature Service "c" due to the lack of dependency "a"', () => {
      expect(() =>
        featureServiceRegistry.registerFeatureServices(
          [providerDefinitionC],
          'test'
        )
      ).toThrowError(
        new Error(
          'The required Feature Service "a" is not registered and therefore could not be bound to consumer "c".'
        )
      );
    });

    it('doesnt fail to register the Feature Service "b" due to the lack of optional dependency "a"', () => {
      providerDefinitionB = {
        id: 'b',
        optionalDependencies: {featureServices: {a: '^1.0.0'}},
        create: jest.fn(() => ({'1.0.0': jest.fn()}))
      };

      expect(() =>
        featureServiceRegistry.registerFeatureServices(
          [providerDefinitionB],
          'test'
        )
      ).not.toThrowError();

      expect(logger.info.mock.calls).toEqual([
        [
          'The optional Feature Service "a" is not registered and therefore could not be bound to consumer "b".'
        ],
        [
          'The Feature Service "b" has been successfully registered by registrant "test".'
        ]
      ]);
    });

    it('fails to register a Feature Service due to an unsupported dependency version', () => {
      const stateProviderD = {
        id: 'd',
        dependencies: {featureServices: {a: '~1.0'}},
        create: jest.fn()
      };

      expect(() =>
        featureServiceRegistry.registerFeatureServices(
          [providerDefinitionA, stateProviderD],
          'test'
        )
      ).toThrowError(
        new Error(
          'The required Feature Service "a" in the unsupported version range "~1.0" could not be bound to consumer "d". The supported versions are ["1.1.0"].'
        )
      );
    });

    it('does not fail to register a Feature Service due to an unsupported optional dependency version', () => {
      const stateProviderD = {
        id: 'd',
        optionalDependencies: {featureServices: {a: '~1.0'}},
        create: jest.fn(() => ({}))
      };

      expect(() =>
        featureServiceRegistry.registerFeatureServices(
          [providerDefinitionA, stateProviderD],
          'test'
        )
      ).not.toThrowError();

      expect(logger.info.mock.calls).toEqual([
        [
          'The Feature Service "a" has been successfully registered by registrant "test".'
        ],
        [
          'The optional Feature Service "a" in the unsupported version range "~1.0" could not be bound to consumer "d". The supported versions are ["1.1.0"].'
        ],
        [
          'The Feature Service "d" has been successfully registered by registrant "test".'
        ]
      ]);
    });

    it('fails to register a Feature Service due to an invalid dependency version', () => {
      const stateProviderDefinitionD = {
        id: 'd',
        dependencies: {featureServices: {a: ''}},
        create: jest.fn()
      };

      expect(() =>
        featureServiceRegistry.registerFeatureServices(
          [providerDefinitionA, stateProviderDefinitionD],
          'test'
        )
      ).toThrowError(
        new Error(
          'The required Feature Service "a" in an invalid version could not be bound to consumer "d".'
        )
      );
    });

    it('does not fail to register a Feature Service due to an invalid optional dependency version', () => {
      const stateProviderDefinitionD = {
        id: 'd',
        optionalDependencies: {featureServices: {a: ''}},
        create: jest.fn(() => ({}))
      };

      expect(() =>
        featureServiceRegistry.registerFeatureServices(
          [providerDefinitionA, stateProviderDefinitionD],
          'test'
        )
      ).not.toThrowError();

      expect(logger.info.mock.calls).toEqual([
        [
          'The Feature Service "a" has been successfully registered by registrant "test".'
        ],
        [
          'The optional Feature Service "a" in an invalid version could not be bound to consumer "d".'
        ],
        [
          'The Feature Service "d" has been successfully registered by registrant "test".'
        ]
      ]);
    });

    it('fails to register a Feature Service that provides an invalid version', () => {
      const stateProviderDefinitionD = {
        id: 'd',
        create: jest.fn(() => ({'1.0.0': jest.fn(), '2.0': jest.fn()}))
      };

      expect(() =>
        featureServiceRegistry.registerFeatureServices(
          [stateProviderDefinitionD],
          'test'
        )
      ).toThrowError(
        new Error(
          'The Feature Service "d" could not be registered by registrant "test" because it defines the invalid version "2.0".'
        )
      );
    });

    describe('without an ExternalsValidator provided to the FeatureServiceRegistry', () => {
      describe('with a Feature Service definition that is declaring external dependencies', () => {
        beforeEach(() => {
          providerDefinitionA = {
            ...providerDefinitionA,
            dependencies: {
              externals: {
                react: '^16.0.0'
              }
            }
          };
        });

        it("doesn't throw an error", () => {
          expect(() => {
            featureServiceRegistry.registerFeatureServices(
              [providerDefinitionA],
              'test'
            );
          }).not.toThrowError();
        });
      });
    });

    describe('with an ExternalsValidator provided to the FeatureServiceRegistry', () => {
      beforeEach(() => {
        featureServiceRegistry = new FeatureServiceRegistry({
          externalsValidator: mockExternalsValidator,
          logger
        });
      });

      describe('with a Feature Service definition that is failing the externals validation', () => {
        let mockError: Error;

        beforeEach(() => {
          mockError = new Error('mockError');

          mockExternalsValidator.validate = jest.fn(() => {
            throw mockError;
          });

          providerDefinitionA = {
            ...providerDefinitionA,
            dependencies: {
              externals: {
                react: '^16.0.0'
              }
            }
          };
        });

        it('calls the provided ExternalsValidator with the defined externals', () => {
          try {
            featureServiceRegistry.registerFeatureServices(
              [providerDefinitionA],
              'test'
            );
          } catch {}

          expect(mockExternalsValidator.validate).toHaveBeenCalledWith({
            react: '^16.0.0'
          });
        });

        it('throws the validation error', () => {
          expect(() => {
            featureServiceRegistry.registerFeatureServices(
              [providerDefinitionA],
              'test'
            );
          }).toThrowError(mockError);
        });
      });

      describe('with a Feature Service definition that is not failing the externals validation', () => {
        beforeEach(() => {
          providerDefinitionA = {
            ...providerDefinitionA,
            dependencies: {
              externals: {
                react: '^16.0.0'
              }
            }
          };
        });

        it('calls the provided ExternalsValidator with the defined externals', () => {
          try {
            featureServiceRegistry.registerFeatureServices(
              [providerDefinitionA],
              'test'
            );
          } catch {}

          expect(mockExternalsValidator.validate).toHaveBeenCalledWith({
            react: '^16.0.0'
          });
        });

        it("doesn't throw an error", () => {
          expect(() => {
            featureServiceRegistry.registerFeatureServices(
              [providerDefinitionA],
              'test'
            );
          }).not.toThrowError();
        });
      });

      describe('with a Feature Service definition that declares no externals', () => {
        it('does not call the provided ExternalsValidator', () => {
          featureServiceRegistry.registerFeatureServices(
            [providerDefinitionA],
            'test'
          );

          expect(mockExternalsValidator.validate).not.toHaveBeenCalled();
        });

        it("doesn't throw an error", () => {
          expect(() => {
            featureServiceRegistry.registerFeatureServices(
              [providerDefinitionA],
              'test'
            );
          }).not.toThrowError();
        });
      });
    });
  });

  describe('#bindFeatureServices', () => {
    describe('for a Feature Service consumer without dependencies', () => {
      it('creates a bindings object with no Feature Services', () => {
        expect(featureServiceRegistry.bindFeatureServices({}, 'foo')).toEqual({
          featureServices: {},
          unbind: expect.any(Function)
        });
      });
    });

    describe('for a Feature Service consumer with dependencies', () => {
      it('creates a bindings object with Feature Services', () => {
        featureServiceRegistry = new FeatureServiceRegistry({logger});

        featureServiceRegistry.registerFeatureServices(
          [providerDefinitionA],
          'test'
        );

        expect(binderA.mock.calls).toEqual([]);

        expect(
          featureServiceRegistry.bindFeatureServices(
            {dependencies: {featureServices: {a: '1.1.0'}}},
            'foo'
          )
        ).toEqual({
          featureServices: {a: featureServiceA},
          unbind: expect.any(Function)
        });

        expect(binderA.mock.calls).toEqual([['foo']]);
      });
    });

    describe('for a Feature Service consumer and two optional dependencies', () => {
      describe('with the first dependency missing', () => {
        it('creates a bindings object with Feature Services', () => {
          featureServiceRegistry = new FeatureServiceRegistry({logger});

          featureServiceRegistry.registerFeatureServices(
            [providerDefinitionA],
            'test'
          );

          expect(binderA.mock.calls).toEqual([]);

          expect(
            featureServiceRegistry.bindFeatureServices(
              {
                optionalDependencies: {
                  featureServices: {b: '1.0.0', a: '1.1.0'}
                }
              },
              'foo'
            )
          ).toEqual({
            featureServices: {a: featureServiceA},
            unbind: expect.any(Function)
          });

          expect(binderA.mock.calls).toEqual([['foo']]);
        });
      });

      describe('with the second dependency missing', () => {
        it('creates a bindings object with Feature Services', () => {
          featureServiceRegistry = new FeatureServiceRegistry({logger});

          featureServiceRegistry.registerFeatureServices(
            [providerDefinitionA],
            'test'
          );

          expect(binderA.mock.calls).toEqual([]);

          expect(
            featureServiceRegistry.bindFeatureServices(
              {
                optionalDependencies: {
                  featureServices: {a: '1.1.0', b: '1.0.0'}
                }
              },
              'foo'
            )
          ).toEqual({
            featureServices: {a: featureServiceA},
            unbind: expect.any(Function)
          });

          expect(binderA.mock.calls).toEqual([['foo']]);
        });
      });

      describe('with no dependency missing', () => {
        it('creates a bindings object with Feature Services', () => {
          featureServiceRegistry = new FeatureServiceRegistry({logger});

          featureServiceRegistry.registerFeatureServices(
            [providerDefinitionA, providerDefinitionB],
            'test'
          );

          expect(binderA.mock.calls).toEqual([['b']]);

          expect(
            featureServiceRegistry.bindFeatureServices(
              {
                optionalDependencies: {
                  featureServices: {a: '1.1.0', b: '^1.0.0'}
                }
              },
              'foo'
            )
          ).toEqual({
            featureServices: {a: featureServiceA, b: featureServiceB},
            unbind: expect.any(Function)
          });

          expect(binderA.mock.calls).toEqual([['b'], ['foo']]);
          expect(binderB.mock.calls).toEqual([['foo']]);
        });
      });
    });

    it('fails to create a bindings object for a consumer which is already bound', () => {
      featureServiceRegistry.bindFeatureServices({}, 'foo');

      expect(() =>
        featureServiceRegistry.bindFeatureServices({}, 'foo')
      ).toThrowError(
        new Error(
          'All required Feature Services are already bound to consumer "foo".'
        )
      );
    });

    describe('#unbind', () => {
      it('unbinds the consumer', () => {
        const bindings = featureServiceRegistry.bindFeatureServices(
          providerDefinitionA,
          providerDefinitionA.id
        );

        bindings.unbind();

        expect(() =>
          featureServiceRegistry.bindFeatureServices(
            providerDefinitionA,
            providerDefinitionA.id
          )
        ).not.toThrowError();
      });

      it('unbinds all consumers if applicable, errors are ignored', () => {
        const mockError = new Error('I should be caught.');

        bindingA.unbind = jest.fn(() => {
          throw mockError;
        });

        // The "bindingB" intentionally has no destroy method.

        bindingC.unbind = jest.fn();

        featureServiceRegistry.registerFeatureServices(
          [providerDefinitionA, providerDefinitionB, providerDefinitionC],
          'test'
        );

        const bindings = featureServiceRegistry.bindFeatureServices(
          {
            dependencies: {
              featureServices: {a: '1.1.0', b: '1.0.0', c: '2.0.0'}
            }
          },
          'foo'
        );

        bindings.unbind();

        expect(bindingA.unbind).toHaveBeenCalledTimes(1);
        expect(bindingC.unbind).toHaveBeenCalledTimes(1);

        expect(logger.info.mock.calls).toEqual([
          [
            'The Feature Service "a" has been successfully registered by registrant "test".'
          ],
          [
            'The required Feature Service "a" has been successfully bound to consumer "b".'
          ],
          [
            'The Feature Service "b" has been successfully registered by registrant "test".'
          ],
          [
            'The required Feature Service "a" has been successfully bound to consumer "c".'
          ],
          [
            'The required Feature Service "b" has been successfully bound to consumer "c".'
          ],
          [
            'The Feature Service "c" has been successfully registered by registrant "test".'
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

        expect(logger.error.mock.calls).toEqual([
          [
            'The required Feature Service "a" could not be unbound from consumer "foo".',
            mockError
          ]
        ]);
      });

      it('fails to unbind an already unbound consumer', () => {
        const bindings = featureServiceRegistry.bindFeatureServices(
          providerDefinitionA,
          providerDefinitionA.id
        );

        bindings.unbind();

        expect(() => bindings.unbind()).toThrowError(
          new Error(
            'All required Feature Services are already unbound from consumer "a".'
          )
        );
      });

      it('fails to unbind an already unbound consumer, even if this consumer has been re-bound', () => {
        const bindings = featureServiceRegistry.bindFeatureServices(
          providerDefinitionA,
          providerDefinitionA.id
        );

        bindings.unbind();

        featureServiceRegistry.bindFeatureServices(
          providerDefinitionA,
          providerDefinitionA.id
        );

        expect(() => bindings.unbind()).toThrowError(
          new Error(
            'All required Feature Services are already unbound from consumer "a".'
          )
        );
      });
    });
  });

  describe('without a custom logger', () => {
    let stubbedConsole: Stubbed<Console>;

    beforeEach(() => {
      stubbedConsole = stubMethods(console);
      featureServiceRegistry = new FeatureServiceRegistry();
    });

    afterEach(() => {
      stubbedConsole.restore();
    });

    it('logs messages using the console', () => {
      featureServiceRegistry.registerFeatureServices(
        [providerDefinitionA],
        'test'
      );

      expect(stubbedConsole.stub.info.mock.calls).toEqual([
        [
          'The Feature Service "a" has been successfully registered by registrant "test".'
        ]
      ]);
    });
  });
});
