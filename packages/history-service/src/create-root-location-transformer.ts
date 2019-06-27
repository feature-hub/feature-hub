import * as history from 'history';
import {URLSearchParams} from './internal/url-search-params';

export interface ConsumerHistoryStates {
  readonly [historyKey: string]: unknown;
}

export interface RootLocationOptions {
  readonly consumerPathsQueryParamName: string;

  /**
   * @deprecated Use `primaryConsumerHistoryKey` instead.
   */
  readonly primaryConsumerId?: string;

  readonly primaryConsumerHistoryKey?: string;
}

export type RootLocation = history.Location<ConsumerHistoryStates>;

export type RootLocationDescriptorObject = history.LocationDescriptorObject<
  ConsumerHistoryStates
>;

export interface RootLocationTransformer {
  getConsumerPathFromRootLocation(
    rootLocation: RootLocation,
    historyKey: string
  ): string | undefined;

  createRootLocation(
    currentRootLocation: RootLocationDescriptorObject,
    consumerLocation: history.LocationDescriptorObject,
    historyKey: string
  ): history.LocationDescriptorObject;
}

export interface ConsumerPaths {
  readonly [historyKey: string]: string;
}

function encodeConsumerPaths(consumerPaths: ConsumerPaths): string {
  return JSON.stringify(consumerPaths);
}

function decodeConsumerPaths(encodedConsumerPaths: string): ConsumerPaths {
  return JSON.parse(encodedConsumerPaths);
}

export function addConsumerPath(
  encodedConsumerPaths: string | null,
  historyKey: string,
  path: string
): string {
  return encodeConsumerPaths({
    ...decodeConsumerPaths(encodedConsumerPaths || '{}'),
    [historyKey]: path
  });
}

export function getConsumerPath(
  encodedConsumerPaths: string,
  historyKey: string
): string {
  return decodeConsumerPaths(encodedConsumerPaths)[historyKey];
}

export function createSearchParams(
  location: history.Location
): URLSearchParams {
  return new URLSearchParams(location.search);
}

export function serializeSearchParams(searchParams: URLSearchParams): string {
  return `?${searchParams.toString()}`;
}

export function createRootLocationForPrimaryConsumer(
  currentRootLocation: history.Location,
  primaryConsumerLocation: history.Location,
  consumerPathsQueryParamName: string
): history.LocationDescriptorObject {
  const allSearchParams = createSearchParams(currentRootLocation);
  const newSearchParams = createSearchParams(primaryConsumerLocation);

  if (newSearchParams.has(consumerPathsQueryParamName)) {
    throw new Error(
      `Primary consumer tried to set query parameter ${JSON.stringify(
        consumerPathsQueryParamName
      )} which is reserverd for consumer paths.`
    );
  }

  const consumerPaths = allSearchParams.get(consumerPathsQueryParamName);

  let search: string;

  if (consumerPaths) {
    newSearchParams.set(consumerPathsQueryParamName, consumerPaths);
    search = serializeSearchParams(newSearchParams);
  } else {
    search = primaryConsumerLocation.search;
  }

  const {pathname, hash} = primaryConsumerLocation;

  return {pathname, search, hash};
}

export function createRootLocationForOtherConsumer(
  currentRootLocation: history.Location,
  consumerLocation: history.Location,
  historyKey: string,
  consumerPathsQueryParamName: string
): history.LocationDescriptorObject {
  const allSearchParams = createSearchParams(currentRootLocation);
  const consumerPaths = allSearchParams.get(consumerPathsQueryParamName);

  const newConsumerPaths = addConsumerPath(
    consumerPaths,
    historyKey,
    history.createPath(consumerLocation)
  );

  allSearchParams.set(consumerPathsQueryParamName, newConsumerPaths);

  return {
    pathname: currentRootLocation.pathname,
    search: serializeSearchParams(allSearchParams),
    hash: currentRootLocation.hash
  };
}

export function getPrimaryConsumerHistoryKey(
  options: RootLocationOptions
): string | undefined {
  // tslint:disable-next-line: deprecation
  return options.primaryConsumerHistoryKey || options.primaryConsumerId;
}

export function createRootLocationTransformer(
  options: RootLocationOptions
): RootLocationTransformer {
  return {
    getConsumerPathFromRootLocation: (
      rootLocation: history.Location,
      historyKey: string
    ): string | undefined => {
      const {consumerPathsQueryParamName} = options;
      const primaryConsumerHistoryKey = getPrimaryConsumerHistoryKey(options);
      const isPrimaryConsumer = historyKey === primaryConsumerHistoryKey;
      const searchParams = createSearchParams(rootLocation);

      if (isPrimaryConsumer) {
        searchParams.delete(consumerPathsQueryParamName);

        const pathname = rootLocation.pathname;
        const search = serializeSearchParams(searchParams);

        return history.createPath({pathname, search});
      }

      const consumerPaths = searchParams.get(consumerPathsQueryParamName);

      if (!consumerPaths) {
        return undefined;
      }

      return getConsumerPath(consumerPaths, historyKey);
    },

    createRootLocation: (
      currentRootLocation: history.Location,
      consumerLocation: history.Location,
      historyKey: string
    ): history.LocationDescriptorObject => {
      const primaryConsumerHistoryKey = getPrimaryConsumerHistoryKey(options);
      const {consumerPathsQueryParamName} = options;
      const isPrimaryConsumer = historyKey === primaryConsumerHistoryKey;

      if (isPrimaryConsumer) {
        return createRootLocationForPrimaryConsumer(
          currentRootLocation,
          consumerLocation,
          consumerPathsQueryParamName
        );
      }

      return createRootLocationForOtherConsumer(
        currentRootLocation,
        consumerLocation,
        historyKey,
        consumerPathsQueryParamName
      );
    }
  };
}
