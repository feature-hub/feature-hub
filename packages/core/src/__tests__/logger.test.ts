// tslint:disable:no-implicit-dependencies

import {Stubbed, stubMethods} from 'jest-stub-methods';
import {Logger} from '..';

interface LoggerConsoleMaping {
  loggerMethod: keyof Logger;
  consoleMethod: keyof Console;
}

describe('consoleLogger', () => {
  let stubbedConsole: Stubbed<Console>;
  let consoleLogger: Logger;

  beforeAll(async () => {
    stubbedConsole = stubMethods(console);

    // we need to import the consoleLogger after stubbing the console methods
    // tslint:disable-next-line:no-require-imports
    consoleLogger = require('..').consoleLogger;
  });

  afterAll(() => {
    stubbedConsole.restore();
  });

  describe('#trace', () => {
    it('delegates to console.trace', () => {
      consoleLogger.trace('test');

      expect(stubbedConsole.stub.trace.mock.calls).toEqual([['test']]);
    });
  });

  const loggerConsoleMappings: LoggerConsoleMaping[] = [
    {loggerMethod: 'trace', consoleMethod: 'trace'},
    {loggerMethod: 'debug', consoleMethod: 'debug'},
    {loggerMethod: 'info', consoleMethod: 'info'},
    {loggerMethod: 'warn', consoleMethod: 'warn'},
    {loggerMethod: 'error', consoleMethod: 'error'},
    {loggerMethod: 'fatal', consoleMethod: 'error'}
  ];

  for (const {loggerMethod, consoleMethod} of loggerConsoleMappings) {
    describe(`#${loggerMethod}`, () => {
      it(`delegates to console.${consoleMethod}`, () => {
        consoleLogger[loggerMethod]('test');

        expect(stubbedConsole.stub[consoleMethod].mock.calls).toEqual([
          ['test']
        ]);
      });

      it('preserves the call stack', () => {
        stubbedConsole.stub[consoleMethod].mockImplementationOnce(() => {
          throw new Error(
            `mock error for ${JSON.stringify({loggerMethod, consoleMethod})}`
          );
        });

        expect.assertions(1);

        try {
          consoleLogger[loggerMethod]('test');
        } catch (error) {
          expect(error.stack).not.toMatch(/logger\.js/);
        }
      });
    });
  }
});
