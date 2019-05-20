import {
  ConsumerLocation,
  RootLocationTransformer
} from '@feature-hub/history-service';
import {Location, createPath} from 'history';
import {URLSearchParams} from './url-search-params';

export const rootLocationTransformer: RootLocationTransformer = {
  getConsumerPathFromRootLocation: (rootLocation, consumerId) => {
    const searchParams = new URLSearchParams(rootLocation.search);

    return searchParams.get(consumerId) || undefined;
  },

  createRootLocation: (rootLocation, consumerLocation, consumerId) => {
    if (!rootLocation) {
      throw new Error('ppp');
    }
    const searchParams = new URLSearchParams(rootLocation.search);

    if (consumerLocation) {
      searchParams.set(consumerId, createPath(consumerLocation));
    } else {
      searchParams.delete(consumerId);
    }

    const {pathname, state} = rootLocation;

    return {
      pathname,
      search: searchParams.toString(),
      state
    };
  },

  createRootLocationForMultipleConsumers(
    ..._consumerLocations: ConsumerLocation[]
  ): Location {
    throw new Error('not implementted yet.');
  }
};
