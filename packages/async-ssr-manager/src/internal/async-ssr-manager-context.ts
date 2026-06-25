import type {Logger} from '@feature-hub/logger';
import type {AsyncSsrManagerDependencies} from '..';

export interface AsyncSsrManagerContext {
  readonly logger: Logger;
}

export function createAsyncSsrManagerContext(
  featureServices: AsyncSsrManagerDependencies,
): AsyncSsrManagerContext {
  const logger = featureServices['s2:logger'] || console;

  return {logger};
}
