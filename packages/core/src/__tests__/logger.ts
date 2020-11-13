import {Logger} from '../logger';

export type MockLogger = {
  readonly [key in keyof Logger]: Logger[key] & jest.Mock;
};

export const logger: MockLogger = {
  trace: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
