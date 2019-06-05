import * as history from 'history';
import {
  addConsumerPath,
  getConsumerPath,
  removeConsumerPath
} from './internal/consumer-paths';
import {URLSearchParams} from './internal/url-search-params';

export interface RootLocationOptions {
  readonly consumerPathsQueryParamName: string;
  readonly primaryConsumerId?: string;
}

export interface RootLocationTransformer {
  getConsumerPathFromRootLocation(
    rootLocation: history.Location,
    consumerId: string
  ): string | undefined;

  createRootLocation(
    consumerLocation: history.Location | undefined,
    currentRootLocation: history.Location,
    consumerId: string
  ): history.LocationDescriptorObject;
}

function createRootLocationForPrimaryConsumer(
  currentRootLocation: history.Location,
  primaryConsumerLocation: history.Location | undefined,
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
    search = newSearchParams.toString();
  } else {
    search = primaryConsumerLocation ? primaryConsumerLocation.search : '';
  }

  const pathname = primaryConsumerLocation
    ? primaryConsumerLocation.pathname
    : '/';

  const hash = primaryConsumerLocation
    ? primaryConsumerLocation.hash
    : undefined;

  return {pathname, search, hash};
}

function createRootLocationForOtherConsumer(
  currentRootLocation: history.Location,
  consumerLocation: history.Location | undefined,
  consumerId: string,
  consumerPathsQueryParamName: string
): history.LocationDescriptorObject {
  const allSearchParams = createSearchParams(currentRootLocation);
  const consumerPaths = allSearchParams.get(consumerPathsQueryParamName);

  const newConsumerPaths = consumerLocation
    ? addConsumerPath(
        consumerPaths,
        consumerId,
        history.createPath(consumerLocation)
      )
    : removeConsumerPath(consumerPaths, consumerId);

  if (newConsumerPaths) {
    allSearchParams.set(consumerPathsQueryParamName, newConsumerPaths);
  } else {
    allSearchParams.delete(consumerPathsQueryParamName);
  }

  return {
    pathname: currentRootLocation.pathname,
    search: allSearchParams.toString(),
    hash: currentRootLocation.hash
  };
}

function createSearchParams(
  location: history.Location | undefined
): URLSearchParams {
  return new URLSearchParams(location && location.search);
}

export function createRootLocationTransformer(
  options: RootLocationOptions
): RootLocationTransformer {
  return {
    getConsumerPathFromRootLocation: (
      rootLocation: history.Location,
      consumerId: string
    ): string | undefined => {
      const {consumerPathsQueryParamName, primaryConsumerId} = options;
      const isPrimaryConsumer = consumerId === primaryConsumerId;
      const searchParams = createSearchParams(rootLocation);

      if (isPrimaryConsumer) {
        searchParams.delete(consumerPathsQueryParamName);

        const pathname = rootLocation.pathname;
        const search = searchParams.toString();

        return history.createPath({pathname, search});
      }

      const consumerPaths = searchParams.get(consumerPathsQueryParamName);

      if (!consumerPaths) {
        return undefined;
      }

      return getConsumerPath(consumerPaths, consumerId);
    },

    createRootLocation: (
      consumerLocation: history.Location | undefined,
      currentRootLocation: history.Location,
      consumerId: string
    ): history.LocationDescriptorObject => {
      const {consumerPathsQueryParamName, primaryConsumerId} = options;
      const isPrimaryConsumer = consumerId === primaryConsumerId;

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
        consumerId,
        consumerPathsQueryParamName
      );
    }
  };
}
