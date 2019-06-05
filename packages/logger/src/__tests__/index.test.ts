// tslint:disable:no-implicit-dependencies

import {
  FeatureServiceEnvironment,
  FeatureServiceProviderDefinition
} from '@feature-hub/core';
import {Stub, Stubbed, stubMethods} from 'jest-stub-methods';
import {Logger, SharedLogger, defineLogger} from '..';

describe('defineLogger', () => {
  let mockEnv: FeatureServiceEnvironment<{}>;

  let loggerDefinition: FeatureServiceProviderDefinition<SharedLogger>;

  beforeEach(() => {
    mockEnv = {featureServices: {}};
    loggerDefinition = defineLogger();
  });

  it('creates a Logger definition', () => {
    expect(loggerDefinition.id).toBe('s2:logger');
    expect(loggerDefinition.dependencies).toBeUndefined();
  });

  describe('#create', () => {
    it('creates a shared Feature Service containing version 1.0.0', () => {
      const sharedLogger = loggerDefinition.create(mockEnv);

      expect(sharedLogger['1.0.0']).toBeDefined();
    });
  });

  describe('Logger', () => {
    let logger: Logger;

    describe('with the default createConsumerLogger function', () => {
      let stubbedConsole: Stubbed<Console>;

      beforeEach(() => {
        stubbedConsole = stubMethods(console);

        logger = loggerDefinition.create(mockEnv)['1.0.0']('test:id')
          .featureService;
      });

      afterEach(() => {
        stubbedConsole.restore();
      });

      const loggerMethods: (keyof Logger)[] = [
        'trace',
        'debug',
        'info',
        'warn',
        'error'
      ];

      for (const method of loggerMethods) {
        describe(`#${method}`, () => {
          it(`delegates to console.${method}`, () => {
            logger[method]('test');

            expect(stubbedConsole.stub[method].mock.calls).toEqual([['test']]);
          });

          it('preserves the call stack', () => {
            stubbedConsole.stub[method].mockImplementationOnce(() => {
              throw new Error(`mock error for ${method}}`);
            });

            expect.assertions(2);

            try {
              logger[method]('test');
            } catch (error) {
              expect(error.stack).toMatch(
                /logger\/src\/__tests__\/index.test\.(js|ts)/
              );

              expect(error.stack).not.toMatch(/logger\/src\/index\.(js|ts)/);
            }
          });
        });
      }
    });

    describe('with a custom createConsumerLogger function', () => {
      let mockConsumerLogger: Stub<Logger>;
      let mockCreateConsumerLogger: jest.Mock<Stub<Logger>>;

      beforeEach(() => {
        mockConsumerLogger = {
          trace: jest.fn(),
          debug: jest.fn(),
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn()
        };

        mockCreateConsumerLogger = jest.fn(() => mockConsumerLogger);

        loggerDefinition = defineLogger(mockCreateConsumerLogger);

        logger = loggerDefinition.create(mockEnv)['1.0.0']('test:id')
          .featureService;
      });

      it('calls the given createConsumerLogger with the consumerId', () => {
        expect(mockCreateConsumerLogger.mock.calls).toEqual([['test:id']]);
      });

      it('uses the defined consumer logger as Feature Service', () => {
        expect(logger).toBe(mockConsumerLogger);
      });
    });
  });
});
