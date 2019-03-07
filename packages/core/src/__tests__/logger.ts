export type MockObject<T extends object> = {
  readonly [key in keyof T]: T[key] & jest.Mock
};

export const logger = {
  trace: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};
