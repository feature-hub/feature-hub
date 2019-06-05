import * as history from 'history';
import {RootLocationTransformer} from '../create-root-location-transformer';
import {URLSearchParams} from '../internal/url-search-params';

export const testRootLocationTransformer: RootLocationTransformer = {
  getConsumerPathFromRootLocation: (rootLocation, consumerId) => {
    const searchParams = new URLSearchParams(rootLocation.search);

    return searchParams.get(consumerId) || undefined;
  },

  createRootLocation: (consumerLocation, rootLocation, consumerId) => {
    const searchParams = new URLSearchParams(rootLocation.search);

    if (consumerLocation) {
      searchParams.set(consumerId, history.createPath(consumerLocation));
    } else {
      searchParams.delete(consumerId);
    }

    return {
      pathname: rootLocation.pathname,
      // decodeURIComponent is used here only for a better readability in the test expectations
      search: decodeURIComponent(searchParams.toString()),
      state: rootLocation.state
    };
  }
};
