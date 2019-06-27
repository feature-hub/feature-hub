import {ConsumerPaths} from '../create-root-location-transformer';

export const consumerPathsQueryParamName = '---';

export interface CreateUrlOptions {
  relative?: boolean;
  pathname?: string;
}

export const createSearch = (consumerPaths: ConsumerPaths) =>
  `?${consumerPathsQueryParamName}=${encodeURIComponent(
    JSON.stringify(consumerPaths)
  )}`;

export const createUrl = (
  consumerPaths: ConsumerPaths,
  {relative, pathname = '/'}: CreateUrlOptions = {}
) =>
  `${relative ? '' : 'http://example.com'}${pathname}${createSearch(
    consumerPaths
  )}`;
