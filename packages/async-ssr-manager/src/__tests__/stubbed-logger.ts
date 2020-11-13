import {Logger} from '@feature-hub/logger';

export type Stub<T extends {}> = {
  [key in keyof T]: T[key] extends (...args: unknown[]) => unknown
    ? T[key] & jest.Mock
    : T[key];
};

export const stubbedLogger: Stub<Logger> = {
  trace: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
