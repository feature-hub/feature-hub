// tslint:disable:no-implicit-dependencies
// tslint:disable:no-non-null-assertion

import {
  FeatureServiceEnvironment,
  FeatureServiceProviderDefinition,
} from '@feature-hub/core';
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

      expect(sharedLogger!['1.0.0']).toBeDefined();
    });
  });

  describe('Logger', () => {
    let logger: Logger;

    describe('with the default createConsumerLogger function', () => {
      beforeEach(() => {
        logger = loggerDefinition.create(mockEnv)!['1.0.0']('test:id')
          .featureService;
      });

      const loggerMethods: (keyof Logger)[] = [
        'trace',
        'debug',
        'info',
        'warn',
        'error',
      ];

      describe.each(loggerMethods)('#%s', (method) => {
        let stubbedConsoleMethod: jest.SpyInstance;

        beforeEach(() => {
          stubbedConsoleMethod = jest.spyOn(console, method);
        });

        it(`delegates to console.${method}`, () => {
          logger[method]('test');

          expect(stubbedConsoleMethod.mock.calls).toEqual([['test']]);
        });

        it('preserves the call stack', () => {
          stubbedConsoleMethod.mockImplementationOnce(() => {
            throw new Error(`mock error for ${method}}`);
          });

          expect.assertions(2);

          try {
            logger[method]('test');
          } catch (error) {
            expect((error as Error).stack).toMatch(
              /logger\/src\/__tests__\/index.test\.(js|ts)/
            );

            expect((error as Error).stack).not.toMatch(
              /logger\/src\/index\.(js|ts)/
            );
          }
        });
      });
    });

    describe('with a custom createConsumerLogger function', () => {
      let mockConsumerLogger: Logger;
      let mockCreateConsumerLogger: jest.Mock<Logger>;

      beforeEach(() => {
        mockConsumerLogger = {
          trace: jest.fn(),
          debug: jest.fn(),
          info: jest.fn(),
          warn: jest.fn(),
          error: jest.fn(),
        };

        mockCreateConsumerLogger = jest.fn(() => mockConsumerLogger);

        loggerDefinition = defineLogger(mockCreateConsumerLogger);

        logger = loggerDefinition
          .create(mockEnv)!
          ['1.0.0']('test:id', 'test:name').featureService;
      });

      it('calls the given createConsumerLogger with the consumerId and consumerName', () => {
        expect(mockCreateConsumerLogger.mock.calls).toEqual([
          ['test:id', 'test:name'],
        ]);
      });

      it('uses the defined consumer logger as Feature Service', () => {
        expect(logger).toBe(mockConsumerLogger);
      });
    });
  });
});
