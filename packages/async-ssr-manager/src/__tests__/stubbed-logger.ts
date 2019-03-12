// tslint:disable:no-implicit-dependencies

import {Logger} from '@feature-hub/logger';
import {Stub} from 'jest-stub-methods';

export const stubbedLogger: Stub<Logger> = {
  trace: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
