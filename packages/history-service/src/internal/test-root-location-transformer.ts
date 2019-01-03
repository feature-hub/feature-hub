import * as history from 'history';
import {RootLocationTransformer} from '../create-root-location-transformer';

export const testRootLocationTransformer: RootLocationTransformer = {
  getConsumerPathFromRootLocation: (rootLocation, consumerUid) => {
    const searchParams = new URLSearchParams(rootLocation.search);

    return searchParams.get(consumerUid) || undefined;
  },

  createRootLocation: (consumerLocation, rootLocation, consumerUid) => {
    const searchParams = new URLSearchParams(rootLocation.search);

    if (consumerLocation) {
      searchParams.set(consumerUid, history.createPath(consumerLocation));
    } else {
      searchParams.delete(consumerUid);
    }

    return {
      pathname: rootLocation.pathname,
      // decodeURIComponent is used here only for a better readability in the test expectations
      search: decodeURIComponent(searchParams.toString()),
      state: rootLocation.state
    };
  }
};
