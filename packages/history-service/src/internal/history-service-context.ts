import {Logger} from '@feature-hub/logger';
import {ServerRequestV1} from '@feature-hub/server-request';
import {HistoryServiceDependencies} from '..';

export interface HistoryServiceContext {
  readonly logger: Logger;
  readonly serverRequest?: ServerRequestV1;
}

export function createHistoryServiceContext(
  featureServices: HistoryServiceDependencies
): HistoryServiceContext {
  const logger = featureServices['s2:logger'] || console;
  const serverRequest = featureServices['s2:server-request'];

  return {logger, serverRequest};
}
