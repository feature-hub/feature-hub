import {Logger} from '@feature-hub/logger';
import {AsyncSsrManagerDependencies} from '..';

export interface AsyncSsrManagerContext {
  logger: Logger;
}

export function createAsyncSsrManagerContext(
  featureServices: AsyncSsrManagerDependencies
): AsyncSsrManagerContext {
  const logger = featureServices['s2:logger'] || console;

  return {logger};
}
