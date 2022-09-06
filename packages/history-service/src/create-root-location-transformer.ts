import * as history from 'history';
import {ConsumerLocationV3} from '.';
import {URLSearchParams} from './internal/url-search-params';

export interface RootLocationOptions {
  readonly consumerPathsQueryParamName: string;
  readonly primaryConsumerHistoryKey?: string;
}

export interface RootLocationTransformer {
  getConsumerPathFromRootLocation(
    rootLocation: Partial<history.Location>,
    historyKey: string
  ): string | undefined;

  createRootLocation(
    currentRootLocation: Partial<history.Location>,
    consumerLocation: Partial<history.Location>,
    historyKey: string
  ): Partial<history.Path>;

  createNewRootLocationForMultipleConsumers?(
    ...consumerLocations: ConsumerLocationV3[]
  ): Partial<history.Path>;
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
    [historyKey]: path,
  });
}

export function getConsumerPath(
  encodedConsumerPaths: string,
  historyKey: string
): string {
  return decodeConsumerPaths(encodedConsumerPaths)[historyKey];
}

export function createSearchParams(
  location: Partial<history.Path>
): URLSearchParams {
  return new URLSearchParams(location.search);
}

export function serializeSearchParams(searchParams: URLSearchParams): string {
  return `?${searchParams.toString()}`;
}

export function createRootLocationForPrimaryConsumer(
  currentRootLocation: Partial<history.Location>,
  primaryConsumerLocation: Partial<history.Path>,
  consumerPathsQueryParamName: string
): Partial<history.Path> {
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

  let search: string | undefined;

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
  currentRootLocation: Partial<history.Location>,
  consumerLocation: Partial<history.Path>,
  historyKey: string,
  consumerPathsQueryParamName: string
): Partial<history.Path> {
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
    hash: currentRootLocation.hash,
  };
}

export function createRootLocationTransformer(
  options: RootLocationOptions
): RootLocationTransformer {
  return {
    getConsumerPathFromRootLocation: (
      rootLocation: history.Location,
      historyKey: string
    ): string | undefined => {
      const {consumerPathsQueryParamName, primaryConsumerHistoryKey} = options;
      const isPrimaryConsumer = historyKey === primaryConsumerHistoryKey;
      const searchParams = createSearchParams(rootLocation);

      if (isPrimaryConsumer) {
        searchParams.delete(consumerPathsQueryParamName);

        const {pathname, hash} = rootLocation;
        const search = serializeSearchParams(searchParams);

        return history.createPath({pathname, search, hash});
      }

      const consumerPaths = searchParams.get(consumerPathsQueryParamName);

      if (!consumerPaths) {
        return undefined;
      }

      return getConsumerPath(consumerPaths, historyKey);
    },

    createRootLocation: (
      currentRootLocation: history.Location,
      consumerLocation: Partial<history.Path>,
      historyKey: string
    ): Partial<history.Path> => {
      const {consumerPathsQueryParamName, primaryConsumerHistoryKey} = options;
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
    },
  };
}
